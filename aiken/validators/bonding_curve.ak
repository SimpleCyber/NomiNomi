use aiken/hash.{Blake2b_224, Hash}
use aiken/list
use aiken/transaction.{ScriptContext, Spend, Transaction, Output}
use aiken/transaction/credential.{Address, VerificationKey}
use aiken/transaction/value.{Value, PolicyId, AssetName}

// --- Constants ---

const decimals: Int = 1000000000000000000 // 10^18
const initial_price: Int = 30000000000000 // 3.00 * 10^13
const k: Int = 8000000000000000 // 8 * 10^15
const platform_fee_lovelace: Int = 1000000 // 1 ADA fixed fee for example, or calculated

// Platform fee address (PubKeyHash) - Placeholder, needs actual PHK
// addr1q9zqmfvgpdd5tlh7jk3fhnrr3rjcl8mkknkw3j2233tyh7j8kqykw07ktc6wqmrql4alr45f9qqcpcsteypsemf5l4cscxmajm
// This is a bech32 address. In a real app, we'd pass the PHK as a parameter.
// For this code, I'll assume the fee is checked against a specific output address.

// --- Math Functions ---

// Improved helper function to calculate e^x for larger x using a Taylor series approximation
// x is scaled by 10^18
fn exp(x: Int) -> Int {
  let sum = decimals // Start with 1 * 10^18
  let term = decimals // Initial term = 1 * 10^18
  let x_power = x
  
  // 20 iterations
  // We can't use a simple for loop in Aiken like C-style, we use recursion or fold.
  // Using a recursive helper for the loop.
  do_exp_loop(1, 20, sum, term, x_power)
}

fn do_exp_loop(i: Int, limit: Int, sum: Int, term: Int, x_power: Int) -> Int {
  if i > limit {
    sum
  } else {
    // term = (term * xPower) / (i * 10**18)
    let new_term = (term * x_power) / (i * decimals)
    let new_sum = sum + new_term
    
    if new_term < 1 {
      new_sum
    } else {
      do_exp_loop(i + 1, limit, new_sum, new_term, x_power)
    }
  }
}

// Calculate cost in Lovelace
fn calculate_cost(current_supply: Int, tokens_to_buy: Int) -> Int {
  // exponent1 = (K * (currentSupply + tokensToBuy)) / 10**18
  let exponent1 = (k * (current_supply + tokens_to_buy)) / decimals
  let exponent2 = (k * current_supply) / decimals

  let exp1 = exp(exponent1)
  let exp2 = exp(exponent2)

  // Cost = (P0 * 10^18 * (exp1 - exp2)) / K
  // Note: logic from Solidity: (INITIAL_PRICE * 10**18 * (exp1 - exp2)) / K
  (initial_price * decimals * (exp1 - exp2)) / k
}

// --- Types ---

type State {
  Funding
  ReadyForLP
  Live
}

type Datum {
  circulating_supply: Int,
  reserve_lovelace: Int,
  max_supply: Int,
  funding_goal_lovelace: Int,
  state: State,
  // Identify the token being traded
  token_policy_id: PolicyId,
  token_asset_name: AssetName,
}

type Redeemer {
  Buy { amount: Int }
  Sell { amount: Int }
  LaunchLP
}

// --- Validator ---

validator {
  fn spend(datum: Datum, redeemer: Redeemer, ctx: ScriptContext) -> Bool {
    let ScriptContext { transaction, purpose } = ctx
    expect Spend(own_ref) = purpose
    
    // Find the own input to get the value? We have the datum.
    // We need to find the own output (the continuing datum).
    
    expect Some(own_input) =
      list.find(transaction.inputs, fn(input) { input.output_reference == own_ref })
    
    let own_address = own_input.output.address

    // Find the output going back to the script
    expect Some(own_output) =
      list.find(transaction.outputs, fn(output) { output.address == own_address })

    // Parse output datum
    expect InlineDatum(output_datum_data) = own_output.datum
    expect output_datum: Datum = output_datum_data

    when redeemer is {
      Buy { amount } -> {
        // 1. Validate State
        expect datum.state == Funding
        
        // 2. Calculate Cost
        // Supply is scaled? Solidity used (currentSupply - INIT_SUPPLY) / DECIMALS.
        // Here we assume `circulating_supply` is the raw amount.
        // We need to be consistent with scaling. 
        // Let's assume `circulating_supply` is in atomic units.
        // And `calculate_cost` expects scaled units? 
        // The Solidity code: `currentSupplyScaled = (currentSupply - INIT_SUPPLY) / DECIMALS`
        // Let's assume we pass atomic units and handle scaling inside or outside.
        // For simplicity, let's assume the math functions expect atomic units if we adjust constants, 
        // OR we scale down here.
        // Solidity: `uint currentSupplyScaled = (currentSupply - INIT_SUPPLY) / DECIMALS;`
        // So it uses "whole tokens" count for the curve.
        
        let current_supply_scaled = datum.circulating_supply / decimals
        let amount_scaled = amount / decimals
        
        let cost = calculate_cost(current_supply_scaled, amount_scaled)
        
        // 3. Validate Output Datum
        let expected_supply = datum.circulating_supply + amount
        let expected_reserve = datum.reserve_lovelace + cost
        
        expect output_datum.circulating_supply == expected_supply
        expect output_datum.reserve_lovelace == expected_reserve
        expect output_datum.token_policy_id == datum.token_policy_id
        expect output_datum.token_asset_name == datum.token_asset_name
        
        // 4. Check Funding Goal
        if expected_reserve >= datum.funding_goal_lovelace {
           expect output_datum.state == ReadyForLP
        } else {
           expect output_datum.state == Funding
        }

        // 5. Validate Value Locked
        // The script output must have the new reserve amount of ADA
        let lovelace_in_output = value.lovelace_of(own_output.value)
        expect lovelace_in_output >= expected_reserve
        
        // 6. Validate User received tokens?
        // In Cardano, the validator ensures the script *state* is correct. 
        // If the script output has the correct reserve, and the input had the old reserve,
        // then the user MUST have put in the difference (cost).
        // And if the script output has less tokens (if it held them), the user got them.
        // BUT, usually the script holds the tokens too.
        // Let's assume the script holds the uncirculating supply.
        // Input Tokens = Max - OldCirculating
        // Output Tokens = Max - NewCirculating
        let tokens_in_output = value.quantity_of(own_output.value, datum.token_policy_id, datum.token_asset_name)
        let expected_tokens_remaining = datum.max_supply - expected_supply
        expect tokens_in_output >= expected_tokens_remaining

        True
      }
      
      Sell { amount } -> {
         // Inverse of Buy
         // 1. Validate State
         expect datum.state == Funding // Can we sell during Funding? Yes.
         
         // 2. Calculate Refund
         // Refund is the cost to buy the *last* 'amount' tokens.
         // Start supply = current - amount
         let new_supply = datum.circulating_supply - amount
         let new_supply_scaled = new_supply / decimals
         let amount_scaled = amount / decimals
         
         let refund = calculate_cost(new_supply_scaled, amount_scaled)
         
         // 3. Validate Output Datum
         expect output_datum.circulating_supply == new_supply
         expect output_datum.reserve_lovelace == datum.reserve_lovelace - refund
         expect output_datum.state == Funding // Selling shouldn't trigger LP usually, unless we drop below?
         
         // 4. Validate Value Locked
         let lovelace_in_output = value.lovelace_of(own_output.value)
         expect lovelace_in_output >= output_datum.reserve_lovelace
         
         // 5. Validate Tokens returned to script
         let tokens_in_output = value.quantity_of(own_output.value, datum.token_policy_id, datum.token_asset_name)
         let expected_tokens_remaining = datum.max_supply - new_supply
         expect tokens_in_output >= expected_tokens_remaining
         
         True
      }

      LaunchLP -> {
        // TODO: Implement LP launch logic (sending funds to DEX)
        expect datum.state == ReadyForLP
        // For now, just allow transition to Live if funds are moved?
        // Or verify output goes to a specific address?
        True
      }
    }
  }
}
