"use server";

import { ADMIN_EMAILS } from "@/lib/constants";

export async function fetchEnvironmentKeys(email: string) {
  if (!ADMIN_EMAILS.includes(email)) {
    throw new Error("Unauthorized");
  }

  return [
    { key: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", value: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "", isSensitive: true },
    { key: "NEXT_PUBLIC_AGORA_APP_ID", value: process.env.NEXT_PUBLIC_AGORA_APP_ID || "", isSensitive: true },
    { key: "NEXT_PUBLIC_BLOCKFROST_PROJECT_ID", value: process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID || "", isSensitive: true },
    { key: "NEXT_PUBLIC_FIREBASE_API_KEY", value: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "", isSensitive: true },
    { key: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", value: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "", isSensitive: true },
    { key: "NEXT_PUBLIC_FIREBASE_PROJECT_ID", value: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "", isSensitive: true },
    { key: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", value: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "", isSensitive: true },
    { key: "NEXT_PUBLIC_FIREBASE_APP_ID", value: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "", isSensitive: true },
    { key: "PINATA_API_KEY", value: process.env.PINATA_API_KEY || "", isSensitive: true },
    { key: "PINATA_SECRET_JWT_KEY", value: process.env.PINATA_SECRET_JWT_KEY || "", isSensitive: true },
    { key: "NEXT_PUBLIC_IPFS_GATEWAY", value: process.env.NEXT_PUBLIC_IPFS_GATEWAY || "", isSensitive: true },
    { key: "NEXT_PUBLIC_PLATFORM_FEE_ADDRESS", value: process.env.NEXT_PUBLIC_PLATFORM_FEE_ADDRESS || "", isSensitive: true },
    { key: "NEXT_PUBLIC_ADMIN_STAKE_KEY", value: process.env.NEXT_PUBLIC_ADMIN_STAKE_KEY || "", isSensitive: true }
  ];
}
