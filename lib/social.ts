import { db } from "./firebase";
import { doc, runTransaction, getDoc, serverTimestamp } from "firebase/firestore";

export async function followUser(currentUserId: string, targetUserId: string) {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) return;

    const currentUserRef = doc(db, "users", currentUserId);
    const targetUserRef = doc(db, "users", targetUserId);
    const followingRef = doc(db, "users", currentUserId, "following", targetUserId);
    const followerRef = doc(db, "users", targetUserId, "followers", currentUserId);

    try {
        await runTransaction(db, async (transaction) => {
            // 1. READS
            const followingDoc = await transaction.get(followingRef);
            if (followingDoc.exists()) {
                throw "Already following";
            }

            const currentUserDoc = await transaction.get(currentUserRef);
            const targetUserDoc = await transaction.get(targetUserRef);

            if (!currentUserDoc.exists() || !targetUserDoc.exists()) {
                throw "User not found";
            }

            const currentFollowingCount = currentUserDoc.data().following || 0;
            const targetFollowersCount = targetUserDoc.data().followers || 0;

            // 2. WRITES
            // Create following/follower documents
            transaction.set(followingRef, {
                timestamp: serverTimestamp(),
            });
            transaction.set(followerRef, {
                timestamp: serverTimestamp(),
            });

            // Update counts
            transaction.update(currentUserRef, {
                following: currentFollowingCount + 1
            });
            transaction.update(targetUserRef, {
                followers: targetFollowersCount + 1
            });
        });
        return true;
    } catch (error) {
        console.error("Error following user:", error);
        return false;
    }
}

export async function unfollowUser(currentUserId: string, targetUserId: string) {
    if (!currentUserId || !targetUserId) return;

    const currentUserRef = doc(db, "users", currentUserId);
    const targetUserRef = doc(db, "users", targetUserId);
    const followingRef = doc(db, "users", currentUserId, "following", targetUserId);
    const followerRef = doc(db, "users", targetUserId, "followers", currentUserId);

    try {
        await runTransaction(db, async (transaction) => {
            // 1. READS
            const followingDoc = await transaction.get(followingRef);
            if (!followingDoc.exists()) {
                throw "Not following";
            }

            const currentUserDoc = await transaction.get(currentUserRef);
            const targetUserDoc = await transaction.get(targetUserRef);

            const currentFollowingCount = currentUserDoc.exists() ? (currentUserDoc.data().following || 0) : 0;
            const targetFollowersCount = targetUserDoc.exists() ? (targetUserDoc.data().followers || 0) : 0;

            // 2. WRITES
            // Delete documents
            transaction.delete(followingRef);
            transaction.delete(followerRef);

            // Update counts
            if (currentUserDoc.exists()) {
                transaction.update(currentUserRef, {
                    following: Math.max(currentFollowingCount - 1, 0)
                });
            }

            if (targetUserDoc.exists()) {
                transaction.update(targetUserRef, {
                    followers: Math.max(targetFollowersCount - 1, 0)
                });
            }
        });
        return true;
    } catch (error) {
        console.error("Error unfollowing user:", error);
        return false;
    }
}

export async function isFollowing(currentUserId: string, targetUserId: string): Promise<boolean> {
    if (!currentUserId || !targetUserId) return false;
    try {
        const followingRef = doc(db, "users", currentUserId, "following", targetUserId);
        const docSnap = await getDoc(followingRef);
        return docSnap.exists();
    } catch (error) {
        console.error("Error checking isFollowing:", error);
        return false;
    }
}
