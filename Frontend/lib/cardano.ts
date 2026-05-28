import { Lucid, Blockfrost } from "lucid-cardano";

const BLOCKFROST_PROJECT_ID = process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID;
const NETWORK = "Preprod"; // Or Mainnet based on config

export const initLucid = async (walletApi?: any) => {
  const { Lucid, Blockfrost } = await import("lucid-cardano"); // ⬅️ Lazy import (SSR safe)

  const BLOCKFROST_PROJECT_ID = process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID;
  if (!BLOCKFROST_PROJECT_ID) {
    throw new Error("Blockfrost Project ID not set");
  }

  // Auto-detect network
  let network: "Mainnet" | "Preprod" | "Preview" = "Preprod";
  if (BLOCKFROST_PROJECT_ID.startsWith("mainnet")) {
    network = "Mainnet";
  } else if (BLOCKFROST_PROJECT_ID.startsWith("preview")) {
    network = "Preview";
  }

  try {
    const lucid = await Lucid.new(
      new Blockfrost(
        `https://cardano-${network.toLowerCase()}.blockfrost.io/api/v0`,
        BLOCKFROST_PROJECT_ID,
      ),
      network,
    );

    if (walletApi) {
      lucid.selectWallet(walletApi);
    }

    return lucid;
  } catch (error: any) {
    console.error("Lucid Initialization Error:", error);
    if (error.message?.includes("BigInt")) {
      throw new Error(
        `Network Connection Failed: Possible mismatch. Detected '${network}', but initialization failed.`,
      );
    }
    throw error;
  }
};
