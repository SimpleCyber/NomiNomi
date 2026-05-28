import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createMintToInstruction, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const SOLANA_NETWORK = "mainnet-beta";
export const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";

export const getConnection = () => {
  return new Connection(SOLANA_RPC_URL, "confirmed");
};

export const getAtaAddress = async (mint: string, owner: string) => {
  return await getAssociatedTokenAddress(
    new PublicKey(mint),
    new PublicKey(owner),
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
};
