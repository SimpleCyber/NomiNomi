"use client";

import { useState, useEffect } from "react";
import {
  Copy,
  ExternalLink,
  Loader2,
  MessageCircle,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { UserProfile, getUserProfile } from "@/lib/user";
import { useWallet } from "@/context/WalletContext";
import { followUser, unfollowUser, isFollowing } from "@/lib/social";
import { useRouter } from "next/navigation";

interface ProfileViewProps {
  walletAddress: string;
  initialUserData?: UserProfile | null;
  isOwner?: boolean;
}

export default function ProfileView({
  walletAddress,
  initialUserData,
  isOwner = false,
}: ProfileViewProps) {
  const router = useRouter();
  const { walletAddress: currentUserAddress } = useWallet();
  const [activeTab, setActiveTab] = useState("Balances");
  const [userData, setUserData] = useState<UserProfile | null>(
    initialUserData || null,
  );
  const [createdCoins, setCreatedCoins] = useState<any[]>([]);
  const [loading, setLoading] = useState(!initialUserData);

  // Social State
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

  const tabs = [
    "Balances",
    "Replies",
    "Notifications",
    "Coin Created",
    "Coin Held",
  ];

  const fetchData = async () => {
    if (!walletAddress) return;

    try {
      setLoading(true);

      // Fetch User Data if not provided or if we want to refresh
      // Always refresh to get latest counts
      const profile = await getUserProfile(walletAddress);
      setUserData(profile);

      // Fetch Created Coins
      const q = query(
        collection(db, "memecoins"),
        where("creatorAddress", "==", walletAddress),
      );
      const querySnapshot = await getDocs(q);
      const coins = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCreatedCoins(coins);

      // Check Follow Status
      if (currentUserAddress && !isOwner) {
        const following = await isFollowing(currentUserAddress, walletAddress);
        setIsFollowingUser(following);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [walletAddress, currentUserAddress]);

  const handleFollowToggle = async () => {
    if (!currentUserAddress) {
      toast.error("Please connect your wallet first.");
      return;
    }

    setIsUpdatingFollow(true);
    try {
      if (isFollowingUser) {
        await unfollowUser(currentUserAddress, walletAddress);
        setIsFollowingUser(false);
        toast.success("Unfollowed user.");
        // Optimistically update count
        if (userData) {
          setUserData({
            ...userData,
            followers: Math.max(userData.followers - 1, 0),
          });
        }
      } else {
        await followUser(currentUserAddress, walletAddress);
        setIsFollowingUser(true);
        toast.success("Followed user!");
        // Optimistically update count
        if (userData) {
          setUserData({ ...userData, followers: userData.followers + 1 });
        }
      }
    } catch (error) {
      toast.error("Failed to update follow status.");
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  const handleChat = () => {
    if (!currentUserAddress) {
      toast.error("Please connect your wallet first.");
      return;
    }
    router.push(`/chat?chatWith=${walletAddress}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin w-10 h-10 text-[var(--primary)]" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <p className="text-[var(--muted)]">User not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-green-900 border-2 border-green-500/20">
            {/* Placeholder Avatar - could be dynamic later */}
            <div className="w-full h-full flex items-center justify-center text-3xl">
              🐸
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">{userData.username}</h1>
            <div className="flex items-center gap-2 text-sm text-[var(--muted)] bg-[var(--input-bg)] px-2 py-1 rounded-md w-fit">
              <span>
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
              <button
                onClick={() => copyToClipboard(walletAddress)}
                className="hover:text-[var(--foreground)]"
              >
                <Copy size={14} />
              </button>
              <a
                href={`https://cardanoscan.io/address/${walletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-[var(--foreground)] ml-2"
              >
                View on Cardanoscan <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isOwner && (
            <>
              <button
                onClick={handleChat}
                className="flex items-center gap-2 bg-[var(--input-bg)] hover:bg-[var(--border-color)] text-[var(--foreground)] px-4 py-2 rounded-md font-medium transition-colors border border-[var(--border-color)]"
              >
                <MessageCircle size={18} />
                Chat
              </button>
              <button
                onClick={handleFollowToggle}
                disabled={isUpdatingFollow}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors border ${
                  isFollowingUser
                    ? "bg-[var(--input-bg)] hover:bg-[var(--border-color)] text-[var(--foreground)] border-[var(--border-color)]"
                    : "bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white border-transparent"
                }`}
              >
                {isUpdatingFollow ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : isFollowingUser ? (
                  <>
                    <UserMinus size={18} />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Follow
                  </>
                )}
              </button>
            </>
          )}

          {isOwner && (
            <button
              className="bg-[var(--input-bg)] hover:bg-[var(--border-color)] text-[var(--foreground)] px-6 py-2 rounded-md font-medium transition-colors border border-[var(--border-color)]"
              // Add onClick handler for edit modal if needed, passed from parent
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-8 mb-10 text-sm">
        <div className="flex flex-col items-center">
          <span className="font-bold text-lg">{userData.followers}</span>
          <span className="text-[var(--muted)]">Followers</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-bold text-lg">{userData.following}</span>
          <span className="text-[var(--muted)]">Following</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-bold text-lg">{createdCoins.length}</span>
          <span className="text-[var(--muted)]">Created coins</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border-color)] mb-6 overflow-x-auto">
        <div className="flex gap-6 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === tab
                  ? "text-green-500"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === "Balances" && (
          <div>
            <div className="flex justify-between text-sm text-[var(--muted)] mb-4 px-2">
              <span>Coins</span>
              <span>Value</span>
            </div>
            {/* Placeholder for ADA Balance */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 flex items-center justify-between hover:bg-[var(--input-bg)] transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center overflow-hidden">
                  <img
                    src="https://cryptologos.cc/logos/cardano-sol-logo.png"
                    alt="ADA"
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div>
                  <div className="font-bold text-[var(--foreground)] group-hover:text-green-500 transition-colors">
                    Cardano (ADA)
                  </div>
                  <div className="text-sm text-[var(--muted)]">0.00 ADA</div>
                </div>
              </div>
              <div className="font-bold text-[var(--foreground)]">$0.00</div>
            </div>
          </div>
        )}

        {activeTab === "Coin Created" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {createdCoins.length > 0 ? (
              createdCoins.map((coin) => (
                <div
                  key={coin.id}
                  className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 flex items-center gap-4 hover:bg-[var(--input-bg)] transition-colors"
                >
                  <img
                    src={coin.image || "/placeholder.png"}
                    alt={coin.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-bold">{coin.name}</div>
                    <div className="text-sm text-[var(--muted)]">
                      {coin.symbol}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-10 text-[var(--muted)]">
                <p>No coins created yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab !== "Balances" && activeTab !== "Coin Created" && (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--muted)]">
            <div className="mb-4 text-4xl opacity-20">📭</div>
            <p>No {activeTab.toLowerCase()} yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
