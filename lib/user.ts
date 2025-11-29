import { db } from "./firebase";
import { collection, query, where, getDocs, limit, startAt, endAt, orderBy, doc, getDoc } from "firebase/firestore";

export interface UserProfile {
    walletAddress: string;
    username: string;
    followers: number;
    following: number;
    coinsCreated: number;
    coinsHeld: number;
    createdAt?: any;
    lastLogin?: any;
}

export async function searchUsers(searchQuery: string): Promise<UserProfile[]> {
    if (!searchQuery || searchQuery.trim() === "") {
        return [];
    }

    const normalizedQuery = searchQuery.trim(); // Case sensitivity depends on how data is stored. Assuming exact match or simple prefix for now.
    // Note: Firestore is case-sensitive. For robust search, we'd usually store a lowercase version.
    // For now, we'll try a simple prefix search on 'username'.

    try {
        const usersRef = collection(db, "users");
        // This query finds documents where username starts with the query
        // \uf8ff is a high code point to ensure we get all strings starting with the query
        const q = query(
            usersRef,
            orderBy("username"),
            startAt(normalizedQuery),
            endAt(normalizedQuery + "\uf8ff"),
            limit(10)
        );

        const querySnapshot = await getDocs(q);
        const users: UserProfile[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            users.push({
                walletAddress: doc.id,
                username: data.username || "Unknown",
                followers: data.followers || 0,
                following: data.following || 0,
                coinsCreated: data.coinsCreated || 0,
                coinsHeld: data.coinsHeld || 0,
                ...data
            } as UserProfile);
        });

        return users;
    } catch (error) {
        console.error("Error searching users:", error);
        return [];
    }
}

export async function getUserProfile(walletAddress: string): Promise<UserProfile | null> {
    try {
        const userRef = doc(db, "users", walletAddress);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();
            return {
                walletAddress: userSnap.id,
                username: data.username || "Unknown",
                followers: data.followers || 0,
                following: data.following || 0,
                coinsCreated: data.coinsCreated || 0,
                coinsHeld: data.coinsHeld || 0,
                ...data
            } as UserProfile;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
}
