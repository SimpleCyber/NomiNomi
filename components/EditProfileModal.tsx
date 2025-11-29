"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUsername: string;
    walletAddress: string;
    onUpdate: () => void;
}

export default function EditProfileModal({ isOpen, onClose, currentUsername, walletAddress, onUpdate }: EditProfileModalProps) {
    const [username, setUsername] = useState(currentUsername);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!username.trim()) {
            toast.error("Username cannot be empty");
            return;
        }

        setIsLoading(true);
        try {
            const userRef = doc(db, "users", walletAddress);
            await updateDoc(userRef, {
                username: username.trim()
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
                        <label htmlFor="username" className="text-sm font-medium text-[var(--muted)]">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 outline-none focus:border-green-500 transition-colors"
                            placeholder="Enter your username"
                            maxLength={30}
                        />
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
