import { db } from "./firebase";
import {
    collection,
    query,
    orderBy,
    startAt,
    endAt,
    getDocs,
    limit,
    Timestamp,
} from "firebase/firestore";
import { Market } from "@/data/constants";

export async function searchCoins(searchQuery: string): Promise<Market[]> {
    if (!searchQuery || searchQuery.trim() === "") {
        return [];
    }

    const normalizedQuery = searchQuery.trim(); // Case-sensitive prefix search for now

    try {
        const coinsRef = collection(db, "memecoins");
        // Query for name starting with search query
        const q = query(
            coinsRef,
            orderBy("name"),
            startAt(normalizedQuery),
            endAt(normalizedQuery + "\uf8ff"),
            limit(10)
        );

        const querySnapshot = await getDocs(q);
        const coins: Market[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            // Calculate age
            let age = "New";
            if (data.createdAt) {
                const createdAt = data.createdAt instanceof Timestamp
                    ? data.createdAt.toDate()
                    : new Date(data.createdAt);
                const diffInSeconds = Math.floor((new Date().getTime() - createdAt.getTime()) / 1000);

                if (diffInSeconds < 60) age = `${diffInSeconds}s`;
                else if (diffInSeconds < 3600) age = `${Math.floor(diffInSeconds / 60)}m`;
                else if (diffInSeconds < 86400) age = `${Math.floor(diffInSeconds / 3600)}h`;
                else age = `${Math.floor(diffInSeconds / 86400)}d`;
            }

            coins.push({
                id: doc.id as any, // Market interface expects number, but Firestore ID is string. We might need to adjust Market interface or cast.
                // For now, casting to any to avoid type error if ID is strictly number. 
                // Ideally, we should update Market interface to allow string ID.
                name: data.name || "Unknown",
                symbol: data.symbol || "UNK",
                price: data.price || "$0.00", // Placeholder if price not in DB
                volume: data.volume || "$0",
                marketCap: data.marketCap || "$0",
                change: data.change || "0%",
                change5m: data.change5m || "0%",
                change1h: data.change1h || "0%",
                change6h: data.change6h || "0%",
                isPositive: data.isPositive || true,
                chartData: data.chartData || [],
                bondingCurve: data.bondingCurve || 0,
                ath: data.ath || "$0",
                age: age,
                txns: data.txns || 0,
                traders: data.traders || 0,
                image: data.image || "/placeholder.png",
            } as unknown as Market);
        });

        return coins;
    } catch (error) {
        console.error("Error searching coins:", error);
        return [];
    }
}
