import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { 
  createMintToInstruction, 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getMintLen,
  ExtensionType,
  createInitializeMintInstruction,
  createInitializeMetadataPointerInstruction,
  TYPE_SIZE,
  LENGTH_SIZE,
  getTokenMetadata,
} from "@solana/spl-token";
import { 
  createInitializeInstruction, 
  createUpdateFieldInstruction,
  pack
} from "@solana/spl-token-metadata";
import { Keypair } from "@solana/web3.js";

// --- Constants ---
export const PLATFORM_FEE_ADDRESS = "6SVgnyzF6DhZ8sz1y9s9znkaDAtoG2ZUDJEDyXg2oyan"; 
const PRECISION = 1_000_000_000n; 

// --- Math Functions (Bonding Curve) ---
// Kept from original code for consistency
export function expTaylor(x: bigint): bigint {
  let sum = PRECISION;
  let term = PRECISION;
  let n = 1n;
  while (n < 15n) {
    term = (term * x) / (n * PRECISION);
    sum += term;
    n += 1n;
  }
  return sum;
}

export function calculateCost(currentSupply: bigint, amount: bigint): bigint {
    const maxSupply = 1_000_000n;
    const bFactor = 4n * PRECISION;
    const basePrice = 8n; // This is in the context of the curve
    
    const s1 = (currentSupply * bFactor) / maxSupply;
    const s2 = ((currentSupply + amount) * bFactor) / maxSupply;
    
    const e1 = expTaylor(s1);
    const e2 = expTaylor(s2);
    
    // Returning lamports equivalent (if basePrice is adjusted for SOL)
    // On Cardano this was Lovelace (10^-6). On Solana it's Lamports (10^-9).
    // Adjusting basePrice to match SOL scale if needed.
    const cost = (basePrice * maxSupply * (e2 - e1)) / bFactor;
    return cost; 
}

export function calculateAmountOut(currentSupply: bigint, paymentAmount: bigint): bigint {
  let low = 0n;
  let high = 1_000_000n - currentSupply;
  let ans = 0n;
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

// --- Solana Transactions ---

export const mintToken = async (
  sendTransaction: any,
  connection: Connection,
  publicKey: PublicKey,
  metadata: { name: string, symbol: string, image: string, description?: string },
  adminAddress: string = PLATFORM_FEE_ADDRESS
) => {
  try {
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    const adminPublicKey = new PublicKey(adminAddress);
    
    // 5% Supply Split Logic
    const totalSupply = 1_000_000n * (10n ** 6n); // 1M tokens with 6 decimals
    const adminSupply = (totalSupply * 5n) / 100n;
    const userSupply = totalSupply - adminSupply;

    // Metadata for Token-2022 (keep additionalMetadata minimal for rent calculation)
    const metaData = {
        updateAuthority: publicKey,
        mint: mint,
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.image,
        additionalMetadata: [
            ["platform", "NomiNomi"],
        ] as [string, string][],
    };

    const mintLen = getMintLen([ExtensionType.MetadataPointer]);
    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metaData).length;
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

    // --- TX 1: Create Mint + Initialize Metadata ---
    const tx1 = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: publicKey,
            newAccountPubkey: mint,
            space: mintLen,
            lamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeMetadataPointerInstruction(
            mint, publicKey, mint, TOKEN_2022_PROGRAM_ID
        ),
        createInitializeMintInstruction(
            mint, 6, publicKey, null, TOKEN_2022_PROGRAM_ID
        ),
        createInitializeInstruction({
            programId: TOKEN_2022_PROGRAM_ID,
            metadata: mint,
            updateAuthority: publicKey,
            mint: mint,
            mintAuthority: publicKey,
            name: metaData.name,
            symbol: metaData.symbol,
            uri: metaData.uri,
        }),
        createUpdateFieldInstruction({
            programId: TOKEN_2022_PROGRAM_ID,
            metadata: mint,
            updateAuthority: publicKey,
            field: "platform",
            value: "NomiNomi",
        }),
    );

    const sig1 = await sendTransaction(tx1, connection, { signers: [mintKeypair] });
    await connection.confirmTransaction(sig1, 'confirmed');
    console.log("TX1 (Mint Created):", sig1);

    // --- TX 2: Create ATAs, Mint Supply, Transfer Fee ---
    const userATA = await getAssociatedTokenAddress(mint, publicKey, false, TOKEN_2022_PROGRAM_ID);
    const adminATA = await getAssociatedTokenAddress(mint, adminPublicKey, false, TOKEN_2022_PROGRAM_ID);

    const tx2 = new Transaction().add(
        createAssociatedTokenAccountInstruction(
            publicKey, userATA, publicKey, mint, TOKEN_2022_PROGRAM_ID
        ),
        createAssociatedTokenAccountInstruction(
            publicKey, adminATA, adminPublicKey, mint, TOKEN_2022_PROGRAM_ID
        ),
        createMintToInstruction(mint, userATA, publicKey, userSupply, [], TOKEN_2022_PROGRAM_ID),
        createMintToInstruction(mint, adminATA, publicKey, adminSupply, [], TOKEN_2022_PROGRAM_ID),
        SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: adminPublicKey,
            lamports: 0.01 * LAMPORTS_PER_SOL,
        })
    );

    const sig2 = await sendTransaction(tx2, connection);
    await connection.confirmTransaction(sig2, 'confirmed');
    console.log("TX2 (Supply Minted):", sig2);
    
    return { signature: sig2, mint: mint.toBase58() };
  } catch (error) {
    console.error("Minting error:", error);
    throw error;
  }
};

export const buyToken = async (
  sendTransaction: any,
  connection: Connection,
  publicKey: PublicKey,
  amountToBuy: bigint,
  currentSupply: bigint = 0n,
  adminAddress: string = PLATFORM_FEE_ADDRESS
) => {
  try {
    const costLamports = calculateCost(currentSupply, amountToBuy);
    const platformFee = (costLamports * 1n) / 100n; // 1% Trade Fee
    const adminPublicKey = new PublicKey(adminAddress);
    
    const transaction = new Transaction().add(
      // Transfer to bonding curve (in a real app, this would be a program account)
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: adminPublicKey, 
        lamports: Number(costLamports),
      }),
      // Platform Cut
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: adminPublicKey,
        lamports: Number(platformFee),
      })
    );

    const signature = await sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, 'confirmed');
    
    return signature;
  } catch (error) {
    console.error("Buy error:", error);
    throw error;
  }
};

export function calculateRefund(currentSupply: bigint, amount: bigint): bigint {
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

export const sellToken = async (
  sendTransaction: any,
  connection: Connection,
  publicKey: PublicKey,
  amountToSell: bigint,
) => {
  try {
    console.log("Selling tokens:", amountToSell);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return "demo_sell_tx_hash_" + Date.now();
  } catch (error) {
    console.error("Sell error:", error);
    throw error;
  }
};

export const launchLP = async (
  sendTransaction: any,
  connection: Connection,
  publicKey: PublicKey,
  token: any,
) => {
  try {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(PLATFORM_FEE_ADDRESS),
        lamports: 0.01 * LAMPORTS_PER_SOL, 
      })
    );

    const signature = await sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, 'confirmed');
    return signature;
  } catch (error) {
    console.error("LP Launch error:", error);
    throw error;
  }
};

// --- On-Chain Data Fetching (per mint address) ---
// Public RPCs don't support getProgramAccounts for Token-2022.
// Instead, we take a list of known mint addresses (indexed in Firestore)
// and fetch their actual data directly from the Solana blockchain.
export const fetchOnChainMintData = async (
  connection: any,
  mintAddresses: string[]
) => {
  const results = [];
  for (const addr of mintAddresses) {
    try {
      const mintPubkey = new PublicKey(addr);
      const metadata = await getTokenMetadata(connection, mintPubkey);
      if (metadata) {
        results.push({
          id: addr,
          mintAddress: addr,
          name: metadata.name,
          symbol: metadata.symbol,
          image: metadata.uri,
          description: metadata.additionalMetadata.find(m => m[0] === "description")?.[1] || "",
          platform: metadata.additionalMetadata.find(m => m[0] === "platform")?.[1] || "",
          status: "MINTED",
        });
      }
    } catch {
      // Skip mints that fail (deleted, wrong program, etc.)
      continue;
    }
  }
  return results;
};
