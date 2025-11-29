import { db } from "./firebase";
import {
    collection,
    doc,
    addDoc,
    setDoc,
    updateDoc,
    onSnapshot,
    query,
    orderBy,
    where,
    serverTimestamp,
    Timestamp,
    limit
} from "firebase/firestore";

export interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: any; // Firestore Timestamp
}

export interface ChatPreview {
    id: string;
    participants: string[];
    lastMessage: {
        text: string;
        senderId: string;
        timestamp: any;
    };
    updatedAt: any;
}

// Helper to generate a consistent chat ID for two users
export function getChatId(user1: string, user2: string) {
    return [user1, user2].sort().join("_");
}

// Send a message
export async function sendMessage(chatId: string, senderId: string, text: string, participants: string[]) {
    if (!text.trim()) return;

    const chatRef = doc(db, "chats", chatId);
    const messagesRef = collection(db, "chats", chatId, "messages");

    const timestamp = serverTimestamp();

    // Add message to subcollection
    await addDoc(messagesRef, {
        senderId,
        text,
        timestamp
    });

    // Update parent chat document with last message
    // Use setDoc with merge: true in case the chat document doesn't exist yet
    await setDoc(chatRef, {
        participants,
        lastMessage: {
            text,
            senderId,
            timestamp
        },
        updatedAt: timestamp
    }, { merge: true });
}

// Subscribe to messages for a specific chat
export function subscribeToMessages(chatId: string, callback: (messages: Message[]) => void) {
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"), limit(100));

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Message[];
        callback(messages);
    });
}

// Subscribe to active chats for a user
export function subscribeToChats(userId: string, callback: (chats: ChatPreview[]) => void) {
    const chatsRef = collection(db, "chats");
    // Query chats where the user is a participant
    // Removed orderBy to avoid needing a composite index immediately. 
    // We sort client-side instead.
    const q = query(
        chatsRef,
        where("participants", "array-contains", userId)
    );

    return onSnapshot(q, (snapshot) => {
        const chats = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as ChatPreview[];

        // Client-side sort by updatedAt descending
        chats.sort((a, b) => {
            const timeA = a.updatedAt?.seconds || 0;
            const timeB = b.updatedAt?.seconds || 0;
            return timeB - timeA;
        });

        callback(chats);
    });
}
