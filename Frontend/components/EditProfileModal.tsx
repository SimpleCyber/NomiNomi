"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  walletAddress: string;
  onUpdate: () => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  currentUsername,
  walletAddress,
  onUpdate,
}: EditProfileModalProps) {
  const [username, setUsername] = useState(currentUsername);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(""); // Clear error on type
    // Force lowercase and remove spaces
    const value = e.target.value.toLowerCase().replace(/\s/g, "");
    // Only allow letters, numbers, underscores, and periods
    if (/^[a-z0-9_.]*$/.test(value)) {
      setUsername(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Username cannot be empty");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Check for uniqueness
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      // If a document is found AND it's not the current user's document
      const isTaken = querySnapshot.docs.some(doc => doc.id !== walletAddress);

      if (isTaken) {
        setError("Username is already taken. Please choose another.");
        setIsLoading(false);
        return;
      }

      // 2. Update profile
      const userRef = doc(db, "users", walletAddress);
      await updateDoc(userRef, {
        username: username,
      });

      toast.success("Profile updated successfully!");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          <h2 className="text-lg font-bold">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--input-bg)] rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="text-sm font-medium text-[var(--muted)]"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              className={`w-full bg-[var(--input-bg)] border rounded-lg px-3 py-2 outline-none transition-colors ${error ? "border-red-500 focus:border-red-500" : "border-[var(--border-color)] focus:border-green-500"
                }`}
              placeholder="username"
              maxLength={30}
            />
            {error ? (
              <p className="text-xs text-red-500 font-medium">{error}</p>
            ) : (
              <p className="text-xs text-[var(--muted)]">
                Only lowercase letters, numbers, underscores, and periods. No spaces.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium hover:bg-[var(--input-bg)] rounded-lg transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
