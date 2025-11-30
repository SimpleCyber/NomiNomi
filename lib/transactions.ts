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

const PRECISION = 1_000_000_000n; // High precision for math
const A = 20n; // Initial Price Scaling (tuned for ~100 ADA at 1M supply)
const B = 5000n; // Growth Factor (tuned for ~100 ADA at 1M supply)
// Target: Integral(0 to 1M) of Price(x) dx = 100 ADA (100 * 10^6 Lovelace)
// Price(x) = A * exp(B * x / 1M) / PRECISION
// This is a simplified model. For the demo, we will use a curve that hits ~100 ADA at 1M.

// --- Math Functions (Off-chain) ---

// Taylor Series Approximation for e^x
// x is scaled by PRECISION. Returns e^x scaled by PRECISION.
// e^x = 1 + x + x^2/2! + x^3/3! + ...
export function expTaylor(x: bigint): bigint {
  let sum = PRECISION;
  let term = PRECISION;
  let n = 1n;

  // Run for 15 terms for sufficient precision
  while (n < 15n) {
    term = (term * x) / (n * PRECISION);
    sum += term;
    n += 1n;
  }
  return sum;
}

// Calculate Cost in Lovelace to buy 'amount' tokens starting from 'currentSupply'
export function calculateCost(currentSupply: bigint, amount: bigint): bigint {
    // We'll use a simpler exponential-like curve for stability if Taylor is too heavy,
    // but user asked for Taylor.
    // Let's normalize supply to 0-1 range for the exponent to avoid overflow.
    // Max Supply = 1,000,000.
    // x = Supply / 100,000 (scaled down)
    
    const scale = 100_000n; 
    
    // Cost = Integral(current to current+amount) of (A * e^(x/scale))
    // Integral = A * scale * (e^((current+amount)/scale) - e^(current/scale))
    
    // We need to be careful with BigInt overflow.
    // Let's use a slightly different approach: Sum of prices? No, too slow.
    // Let's use the Taylor expansion on the integral difference.
    
    const startX = (currentSupply * PRECISION) / scale;
    const endX = ((currentSupply + amount) * PRECISION) / scale;
    
    const expStart = expTaylor(startX);
    const expEnd = expTaylor(endX);
    
    // Cost = A * scale * (expEnd - expStart) / PRECISION
    // We also need to scale down to Lovelace.
    // Let's adjust A to make it hit ~100 ADA.
    // If A=1, scale=100k. e^10 - 1 ~= 22000.
    // 1 * 100k * 22000 = 2.2B. We want 100M.
    // So A should be small or we adjust scale.
    
    // Let's use a simpler polynomial approximation for the demo if exp is unstable,
    // BUT user asked for Taylor. We will stick to it.
    // Let's use a very small growth factor B inside the exp.
    
    // Revised Formula: Price = BasePrice * e^(B * Supply / MaxSupply)
    // Cost = (BasePrice * MaxSupply / B) * (e^(B * (S+amt)/Max) - e^(B * S/Max))
    
    const maxSupply = 1_000_000n;
    const bFactor = 4n * PRECISION; // B = 4 (Growth Factor)
    const basePrice = 8n; // Base price in Lovelace (tuned for ~107 ADA total)
    
    const s1 = (currentSupply * bFactor) / maxSupply;
    const s2 = ((currentSupply + amount) * bFactor) / maxSupply;
    
    const e1 = expTaylor(s1);
    const e2 = expTaylor(s2);
    
    // Integral result
    // (BasePrice * MaxSupply / B) * (e2 - e1)
    // Note: e1, e2 are scaled by PRECISION. bFactor is scaled by PRECISION.
    // The ratio (e2 - e1) / bFactor is dimensionless and correct.
    
    const cost = (basePrice * maxSupply * (e2 - e1)) / bFactor;
    
    return cost; 
}

export function calculateRefund(currentSupply: bigint, amount: bigint): bigint {
  // Refund is the same logic but backwards: Integral(current-amount to current)
  // = Integral(0 to current) - Integral(0 to current-amount)
  
    const maxSupply = 1_000_000n;
    const bFactor = 4n * PRECISION;
    const basePrice = 8n;
    
    const s1 = ((currentSupply - amount) * bFactor) / maxSupply;
    const s2 = (currentSupply * bFactor) / maxSupply;
    
    const e1 = expTaylor(s1);
    const e2 = expTaylor(s2);
    
    const refund = (basePrice * maxSupply * (e2 - e1)) / bFactor;
    
    return refund;
}

export function calculateAmountOut(currentSupply: bigint, paymentAmount: bigint): bigint {
  // Inverse of calculateCost.
  // Given Cost, find Amount.
  // Since we have a complex function, Binary Search is the safest and easiest way to invert it.
  
  let low = 0n;
  let high = 1_000_000n - currentSupply; // Can't buy more than remaining
  let ans = 0n;
  
  // 20 iterations is enough for 1M range
  for (let i = 0; i < 30; i++) {
      const mid = (low + high) / 2n;
      const cost = calculateCost(currentSupply, mid);
      
      if (cost <= paymentAmount) {
          ans = mid;
          low = mid + 1n;
      } else {
          high = mid - 1n;
      }
  }
  
  return ans;
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
  feeAddress: string = PLATFORM_FEE_ADDRESS // Default to hardcoded if not provided
): Promise<TxHash> => {
  try {
    const lucid = await initLucid(walletApi);
    
    // Simple 1 ADA fee transfer
    const tx = await lucid
      .newTx()
      .payToAddress(feeAddress, { lovelace: 1_000_000n })
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
  currentSupply: bigint = 0n, // Added to calculate cost correctly
  feeAddress: string = PLATFORM_FEE_ADDRESS
): Promise<TxHash> => {
  try {
    const lucid = await initLucid(walletApi);

    // Calculate Cost
    const cost = calculateCost(currentSupply, amountToBuy);

    // Simple transfer of cost to platform
    const tx = await lucid
      .newTx()
      .payToAddress(feeAddress, { lovelace: cost })
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


export const launchLP = async (walletApi: any, token: any, feeAddress: string = PLATFORM_FEE_ADDRESS) => {
  try {
    const lucid = await initLucid(walletApi);
    console.log("Simulating LP Launch for", token.symbol);

    // Placeholder Tx
    const tx = await lucid
      .newTx()
      .payToAddress(feeAddress, { lovelace: 1_000_000n }) // Dummy action
      .complete();

    const signedTx = await tx.sign().complete();
    return await signedTx.submit();
  } catch (error) {
    console.error("LP Launch error:", error);
    throw error;
  }
};




