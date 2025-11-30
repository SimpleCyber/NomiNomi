"use client";

import { useState } from "react";
import {
  X,
  ChevronDown,
  ChevronUp,
  Info,
  Activity,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { uploadJSONToIPFS } from "../lib/ipfs";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp,
  updateDoc,
  doc,
  increment,
  getDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useWallet } from "../context/WalletContext";
import { mintToken } from "../lib/transactions";
import { toast } from "sonner";

export default function CreateCoin() {
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [isMayhemMode, setIsMayhemMode] = useState(false);
  const [showSocials, setShowSocials] = useState(false);
  const [showBannerUpload, setShowBannerUpload] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { walletAddress, isConnected, walletName } = useWallet();

  const checkAntiRugLimit = async (address: string) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Query only by creatorAddress to avoid composite index requirement
    const q = query(
      collection(db, "memecoins"),
      where("creatorAddress", "==", address),
    );

    const querySnapshot = await getDocs(q);

    // Filter client-side
    const recentCoins = querySnapshot.docs.filter((doc) => {
      const data = doc.data();
      if (!data.createdAt) return false;
      // Handle Firestore Timestamp
      const createdAt = data.createdAt.toDate
        ? data.createdAt.toDate()
        : new Date(data.createdAt);
      return createdAt >= thirtyDaysAgo;
    });

    return recentCoins.length;
  };

  const computeMetadataHash = async (metadata: any) => {
    const jsonString = JSON.stringify(metadata);
    const encoder = new TextEncoder();
    const data = encoder.encode(jsonString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  };

  const handleCreateCoin = async () => {
    if (!isConnected || !walletAddress) {
      setError("Please connect your wallet first.");
      return;
    }

    if (!name || !ticker || !description || !imagePreview) {
      setError("Please fill in all required fields and provide an image URL.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 0. Anti-Rug Check
      const createdCount = await checkAntiRugLimit(walletAddress);
      if (createdCount >= 30) {
        throw new Error(
          "Anti-Rug Policy: You have created 30 coins in the last 30 days. Please wait.",
        );
      }

      // 1. Use Image URL directly
      const imageIpfsUrl = imagePreview;

      // 2. Create metadata
      const metadata = {
        name,
        symbol: ticker,
        description,
        image: imageIpfsUrl,
        website,
        twitter,
        telegram,
      };

      // 3. Compute Hash
      const metadataHash = await computeMetadataHash(metadata);

      // 4. Save to Firestore
      const docRef = await addDoc(collection(db, "memecoins"), {
        ...metadata,
        metadataHash,
        maxSupply: 1000000,
        fundingGoalAda: 100,
        status: "FUNDING", // Initial status
        isPaused: false,
        createdAt: serverTimestamp(),
        creatorAddress: walletAddress,
        currentSupply: 0,
        raisedAda: 0,
        marketCap: 0,
        volume: 0,
      });

      console.log("Token created with ID: ", docRef.id);

      // 5. Trigger On-Chain Transaction
      // Note: In a real app, we might want to do this BEFORE Firestore or handle failures gracefully.
      // For now, we'll try to mint. If it fails, the Firestore doc exists but might be invalid on-chain.
      // We can update the doc status to "MINTED" after success.

      try {
        const cardano = (window as any).cardano;
        if (!walletName) throw new Error("Wallet not connected properly");
        const walletApi = await cardano[walletName].enable();

        // Fetch Admin Wallet Address
        const statsRef = doc(db, "platform_stats", "global");
        const statsSnap = await getDoc(statsRef);
        const adminAddress = statsSnap.exists() ? statsSnap.data().adminWalletAddress : undefined;

        const txHash = await mintToken(walletApi, metadata, metadataHash, adminAddress);
        console.log("Mint Tx Hash:", txHash);

        // Update Firestore with Tx Hash
        await updateDoc(docRef, { txHash, status: "MINTED" });

        // Update Platform Stats
        await updateDoc(statsRef, {
            totalEarnings: increment(1), // 1 ADA Fee
            totalTransactions: increment(1)
        });

      } catch (txError) {
        console.error("Transaction failed:", txError);
        // await deleteDoc(docRef); // Optional rollback
        toast.error("On-chain transaction failed. Please try again.");
        throw new Error("On-chain transaction failed. Please try again.");
      }

      // Redirect to token page
      router.push(`/token/${docRef.id}`);
      toast.success("Token created successfully!");
    } catch (err: any) {
      console.error("Error creating coin:", err);
      setError(err.message || "Failed to create coin.");
      toast.error(err.message || "Failed to create coin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Form */}
      <div className="lg:col-span-2 space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Create new coin</h1>
          <h2 className="text-lg font-semibold mb-1">Coin details</h2>
          <p className="text-sm text-[var(--muted)]">
            Choose carefully, these can't be changed once the coin is created
          </p>
        </div>

        {/* Image URL Input */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 space-y-4">
          <h3 className="font-medium">Coin Image</h3>
          <div className="space-y-2">
            <label className="text-sm text-[var(--muted)]">Image URL</label>
            <input
              type="text"
              value={imagePreview || ""}
              onChange={(e) => setImagePreview(e.target.value)}
              placeholder="https://example.com/image.png"
              className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
            />
            <p className="text-xs text-[var(--muted)]">
              Enter a direct link to an image (jpg, png, gif).
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Coin name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Hacker"
                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ticker</label>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="FHAN"
                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Best hacker coin"
              rows={4}
              className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Social Links Accordion */}
          <div className="pt-2">
            <button
              onClick={() => setShowSocials(!showSocials)}
              className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)] hover:text-blue-500 transition-colors"
            >
              <span className="rotate-45">🔗</span>
              Add social links (Optional)
              {showSocials ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            {showSocials && (
              <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Website</label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://devilfruits.vercel.app"
                      className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">X</label>
                    <input
                      type="text"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="https://x.com/satyam_yadav_04"
                      className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telegram</label>
                  <input
                    type="text"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="https://t.me/simplecyber"
                    className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-[var(--input-bg)] rounded-lg">
            <Info size={20} className="text-[var(--muted)]" />
          </div>
          <p className="text-sm text-[var(--muted)]">
            Coin data (social links, banner, etc) can only be added now, and
            can't be changed or edited after creation
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleCreateCoin}
          disabled={isLoading}
          className="w-full md:w-auto bg-violet-400 text-black font-bold py-3 px-8 rounded-lg hover:bg-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Creating...
            </>
          ) : (
            "Create coin"
          )}
        </button>
      </div>

      {/* Right Column - Preview */}
      <div className="hidden lg:block">
        <div className="sticky top-24">
          <h2 className="text-lg font-bold mb-4">Preview</h2>
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden max-w-sm">
            <div className="aspect-[3/3] bg-[var(--input-bg)] relative">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                  No image
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">{name || "Coin Name"}</span>
                <span className="text-sm text-[var(--muted)]">
                  {ticker || "TICKER"}
                </span>
              </div>
              <p className="text-sm text-[var(--muted)] line-clamp-3">
                {description || "Description will appear here..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
