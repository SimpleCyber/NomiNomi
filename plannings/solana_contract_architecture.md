# NomiNomi: Solana Smart Contract & Architecture Plan

## 1. Executive Summary
To transition NomiNomi from a UI simulation to a production-grade decentralized launchpad (like Pump.fun or Moonshot), the core backend must be moved on-chain. This requires building a **Solana Smart Contract (Program)** using the **Anchor Framework (Rust)**. The contract will manage token minting, escrow funds, bonding curve calculations, and liquidity migration in a trustless environment.

To differentiate NomiNomi from competitors, we will introduce a **"Milestone Velocity Curve" (MVC)**—a unique bonding curve mechanism designed to gamify the trading experience, reward early liquidity providers, and disincentivize bot dumping.

---

## 2. Platform Architecture

The platform will consist of three main layers:

### A. The Client (Next.js App)
- **Role:** The user interface, charting, and transaction builder.
- **Tools:** React, `@solana/web3.js`, `@solana/wallet-adapter-react`, lightweight Firestore index.
- **Function:** Reads on-chain data, constructs instructions, and prompts the user's Phantom wallet to sign transactions.

### B. The Indexer (Optional but Recommended)
- **Role:** Fast querying of all platform tokens, charting data, and holder lists without hitting RPC rate limits.
- **Tools:** Helius Webhooks, a custom backend (Node.js/Postgres), or continuing with the current Firestore indexing strategy.

### C. The Solana Program (Anchor / Rust)
- **Role:** The "backend" and source of truth. Handles all math and escrow.
- **Functionality:**
  - **Initialize:** Creates the token mint using the Token-2022 standard and a Program Derived Address (PDA) to hold the supply.
  - **Buy:** Accepts SOL from users, calculates price based on the curve, and transfers tokens from the PDA to the user.
  - **Sell:** Accepts tokens from users, calculates the curve refund, burns or stores the tokens, and extracts SOL from the PDA to the user.
  - **Migrate to LP:** When the curve hits 100% (e.g., $60k market cap), it permanently locks the SOL and all remaining tokens into a Raydium Liquidity Pool.

---

## 3. The Unique Selling Point: Milestone Velocity Curve (MVC) 

Most platforms use a standard exponential or constant-product curve. Bots easily game this by buying block 0 and dumping at 50%. 

**NomiNomi's MVC Mechanism:**
1. **Dynamic Fees (The Anti-Bot Shield):** 
   - Buy/Sell fees start high (e.g., 5%) at the very base of the curve to deter sniper bots.
   - As the market cap hits milestones (25%, 50%, 75%), the trading fee drops drastically (down to 0.5%). This rewards organic volume and makes it cheaper for retail users to trade as the coin gains traction. 
2. **Milestone Cashbacks (The HODL Incentive):**
   - When the curve reaches 50% and 100%, a percentage of the collected protocol fees are distributed as a "cashback airdrop" purely to users who bought early and *haven't sold*. This gamifies holding.
3. **Price Math:** Uses a deterministic quadratic curve `y = mx^2 + b` which provides a slow start (giving real users time to buy) and sharpens aggressively near 100% to push it over the finish line.

---

## 4. Smart Contract Architecture (Data Models)

### A. Global State Account
Holds platform-wide settings to avoid redeploying the contract.
- `admin_wallet` (Pubkey): Receives the platform fees.
- `platform_fee_bps` (u16): The base platform fee.
- `total_volume` (u64): Tracks total SOL processed.

### B. Bonding Curve State Account (PDA)
Created uniquely for every new token launched.
- `mint` (Pubkey): The token's mint address.
- `creator` (Pubkey): The user who launched it.
- `sol_reserve` (u64): Amount of SOL currently in the curve.
- `token_reserve` (u64): Amount of tokens remaining in the curve.
- `complete` (bool): If true, trading stops and LP migration begins.

### C. Program Derived Addresses (PDAs)
PDAs are addresses that do not have private keys; they are controlled purely by the Smart Contract's logic.
- **Mint Authority PDA:** Owns the authority to mint/freeze the token.
- **Curve Vault PDA:** The actual wallet holding the locked SOL and Tokens.

---

## 5. End-to-End User Flow (On-Chain)

### 1. Coin Creation
- User submits metadata (Name, Ticker, Image link) on the UI.
- UI sends an `initialize_curve` transaction to your Anchor program.
- Program creates the Token-2022 mint.
- Program mints the entire supply (1 Billion) to its own Curve Vault PDA.
- Program records the metadata on-chain.

### 2. Buying a Token
- User clicks "Buy 1 SOL".
- UI calls `buy_token(amount: 1 SOL)` on the NomiNomi program.
- Program reads `sol_reserve` and calculates how many tokens 1 SOL buys.
- Program transfers 1 SOL from the user to the Curve Vault PDA.
- Program takes its 1% fee and sends it to the Admin Wallet.
- Program transfers the calculated tokens from the Vault PDA to the user.

### 3. Selling a Token
- User clicks "Sell 1000 NOMI".
- UI calls `sell_token(amount: 1000 Tokens)`.
- Program calculates how much SOL is returned based on the curve.
- Program transfers 1000 NOMI from user back to the Vault PDA.
- Program transfers SOL from Vault PDA back to the user.

### 4. Raydium Migration (The "Graduation")
- When the `sol_reserve` hits the target (e.g., 85 SOL).
- The contract locks. No more buys/sells are allowed via bonding curve.
- A crank backend (or the finalizing user) triggers `migrate_liquidity`.
- The program bundles the 85 SOL and all remaining tokens in the Vault, calls the Raydium CPI (Cross-Program Invocation), creates an AMM pool, and burns the LP tokens forever.

---

## 6. Implementation Roadmap

### Phase 1: Environment & Rust Setup (1 Week)
- Install Rust, Solana CLI, and Anchor Framework.
- Initialize the Anchor project workspace (`anchor init nominomi_core`).
- Write the basic program entrypoints (`initialize_global`, `initialize_curve`).

### Phase 2: Math & Bonding Curve Logic (1-2 Weeks)
- Implement quadratic math safely using `solana-math` or custom checked arithmetic (to prevent overflow/underflow attacks).
- Write rigorous Rust unit tests for the buy/sell bonding curve calculations. If the math is wrong, funds will be trapped or stolen.

### Phase 3: Token-2022 Integration & CPIs (1 Week)
- Implement Cross-Program Invocations (CPIs) to natively call the Token-2022 program to create mints, assign metadata, and transfer tokens within your Rust contract.
- Implement the PDA signature structures (`signer_seeds`).

### Phase 4: UI Integration (1 Week)
- Generate the IDL (Interface Definition Language) from Anchor.
- Use `@coral-xyz/anchor` in the Next.js frontend to replace the current dummy transactions with actual contract calls.
- Connect the frontend bonding curve UI to read directly from the on-chain Curve State Account.

### Phase 5: Raydium AMM Integration & Auditing (2 Weeks+)
- Write the complex CPI to interact with Raydium's AMM smart contract to deploy liquidity.
- Extensively test on Devnet.
- **CRITICAL:** Launchpad contracts hold massive amounts of user SOL. A professional security audit (e.g., OtterSec, Zellic) is highly recommended before Mainnet deployment.

## Next Steps
To begin Option 2, we will need to pause the Next.js UI work momentarily and switch focus to creating an Anchor (Rust) workspace to build the actual intelligent backend. Would you like to initialize the Smart Contract repository?
