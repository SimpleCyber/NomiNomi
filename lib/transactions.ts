import {
  Lucid,
  Blockfrost,
  Data,
  Constr,
  fromText,
  toUnit,
  TxHash,
} from "lucid-cardano";
import { initLucid } from "./cardano";

// --- Constants ---
export const PLATFORM_FEE_ADDRESS =
  "addr_test1qpzqmfvgpdd5tlh7jk3fhnrr3rjcl8mkknkw3j2233tyh7j8kqykw07ktc6wqmrql4alr45f9qqcpcsteypsemf5l4csmsxa7y";

const DECIMALS = 1_000_000n; // 1 ADA = 10^6 Lovelace
const SLOPE = 100n; // Scaled slope

// --- Math Functions (Off-chain) ---

export function calculateCost(currentSupply: bigint, amount: bigint): bigint {
  const newSupply = currentSupply + amount;
  // Cost = 0.5 * slope * (new_supply^2 - current_supply^2)
  return (
    (SLOPE * (newSupply * newSupply - currentSupply * currentSupply)) / 2n
  );
}

export function calculateRefund(currentSupply: bigint, amount: bigint): bigint {
  const newSupply = currentSupply - amount;
  // Refund = 0.5 * slope * (current_supply^2 - new_supply^2)
  return (
    (SLOPE * (currentSupply * currentSupply - newSupply * newSupply)) / 2n
  );
}

export function calculateAmountOut(currentSupply: bigint, paymentAmount: bigint): bigint {
  // paymentAmount is in Lovelace
  // Cost = (SLOPE * (newSupply^2 - currentSupply^2)) / 2
  // 2 * Cost / SLOPE = newSupply^2 - currentSupply^2
  // newSupply = sqrt((2 * Cost / SLOPE) + currentSupply^2)
  
  const bCost = paymentAmount;
  const bSlope = SLOPE;
  const bCurrentSupply = currentSupply;

  const term = (2n * bCost) / bSlope + (bCurrentSupply * bCurrentSupply);
  
  // Integer square root
  let x = term;
  let y = (x + 1n) / 2n;
  while (y < x) {
    x = y;
    y = (x + term / x) / 2n;
  }
  const newSupply = x;
  
  return newSupply - bCurrentSupply;
}

// --- Transactions ---

export const mintToken = async (
  walletApi: any,
  metadata: {
    name: string;
    symbol: string;
    description: string;
    image: string;
  },
  metadataHash: string,
): Promise<TxHash> => {
  try {
    const lucid = await initLucid(walletApi);
    
    // Simple 1 ADA fee transfer
    const tx = await lucid
      .newTx()
      .payToAddress(PLATFORM_FEE_ADDRESS, { lovelace: 1_000_000n })
      .complete();

    const signedTx = await tx.sign().complete();
    return await signedTx.submit();
  } catch (error) {
    console.error("Minting error:", error);
    throw error;
  }
};

export const buyToken = async (
  walletApi: any,
  policyId: string, // Not used in simple mode but kept for signature compatibility
  amountToBuy: bigint,
  currentSupply: bigint = 0n // Added to calculate cost correctly
): Promise<TxHash> => {
  try {
    const lucid = await initLucid(walletApi);

    // Calculate Cost
    const cost = calculateCost(currentSupply, amountToBuy);

    // Simple transfer of cost to platform
    const tx = await lucid
      .newTx()
      .payToAddress(PLATFORM_FEE_ADDRESS, { lovelace: cost })
      .complete();

    const signedTx = await tx.sign().complete();
    return await signedTx.submit();
  } catch (error) {
    console.error("Buy error:", error);
    throw error;
  }
};

export const sellToken = async (
  walletApi: any,
  policyId: string,
  amountToSell: bigint,
): Promise<TxHash> => {
  try {
    // For the demo, selling is a manual process or just a DB update.
    // We return a dummy hash to satisfy the UI.
    // In a real app, the user might sign a message or we might trigger a backend payout.
    console.log("Selling tokens:", amountToSell);
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return "demo_sell_tx_hash_" + Date.now();
  } catch (error) {
    console.error("Sell error:", error);
    throw error;
  }
};


export const launchLP = async (walletApi: any, token: any) => {
  try {
    const lucid = await initLucid(walletApi);
    console.log("Simulating LP Launch for", token.symbol);

    // Placeholder Tx
    const tx = await lucid
      .newTx()
      .payToAddress(PLATFORM_FEE_ADDRESS, { lovelace: 1_000_000n }) // Dummy action
      .complete();

    const signedTx = await tx.sign().complete();
    return await signedTx.submit();
  } catch (error) {
    console.error("LP Launch error:", error);
    throw error;
  }
};




