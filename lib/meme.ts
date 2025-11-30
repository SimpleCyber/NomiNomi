import { db } from "./firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

export interface Meme {
  id: string;
  type: "image" | "video" | "gif";
  data: string; // base64 encoded data or URL
  uploadedBy: string; // wallet address
  uploadedAt: Timestamp;
  fileName?: string;
  isBase64: boolean; // true if base64, false if URL
}

/**
 * Convert file to base64 string
 * @param file - The file to convert
 * @returns Promise with base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Detect media type from file or URL
 */
export function detectMediaType(fileOrUrl: File | string): "image" | "video" | "gif" {
  let extension = "";

  if (typeof fileOrUrl === "string") {
    // Extract extension from URL
    const urlPath = fileOrUrl.split("?")[0]; // Remove query params
    extension = urlPath.split(".").pop()?.toLowerCase() || "";
  } else {
    // Extract from file
    extension = fileOrUrl.name.split(".").pop()?.toLowerCase() || "";
    // Also check MIME type for GIFs
    if (fileOrUrl.type === "image/gif") return "gif";
  }

  // Determine type
  if (extension === "gif") return "gif";
  if (["mp4", "webm", "mov", "avi"].includes(extension)) return "video";
  return "image";
}

/**
 * Compress image file using Canvas API
 * @param file - The file to compress
 * @param quality - Initial quality (0-1)
 * @returns Promise with compressed File
 */
export async function compressImage(file: File, quality = 0.7): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Max dimensions (e.g. 1920x1080) to reduce size
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Compression failed"));
            return;
          }
          const compressedFile = new File([blob], file.name, {
            type: "image/jpeg", // Force JPEG for better compression
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        "image/jpeg",
        quality
      );
    };
    
    img.onerror = (error) => reject(error);
  });
}

/**
 * Upload meme to Firestore (base64 for files, URL for links)
 * @param fileOrUrl - File object or URL string
 * @param walletAddress - The uploader's wallet address
 * @param onProgress - Optional callback for progress (0-100)
 * @returns Promise with the document ID
 */
export async function uploadMeme(
  fileOrUrl: File | string,
  walletAddress: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    let data: string;
    let isBase64: boolean;
    let fileName: string | undefined;
    let mediaType: "image" | "video" | "gif";

    if (typeof fileOrUrl === "string") {
      // It's a URL
      data = fileOrUrl;
      isBase64 = false;
      mediaType = detectMediaType(fileOrUrl);
    } else {
      // It's a file
      if (onProgress) onProgress(10);
      
      let fileToProcess = fileOrUrl;
      mediaType = detectMediaType(fileToProcess);
      
      // Compress if it's an image and larger than 800KB (safe margin for 1MB limit)
      // Note: We don't compress GIFs or Videos here as canvas doesn't support them well
      if (mediaType === "image" && fileToProcess.size > 800 * 1024) {
        console.log(`Compressing image: ${fileToProcess.size / 1024}KB`);
        try {
          // Try to compress
          let quality = 0.7;
          let compressed = await compressImage(fileToProcess, quality);
          
          // If still too big, try harder
          while (compressed.size > 800 * 1024 && quality > 0.1) {
            quality -= 0.2;
            compressed = await compressImage(fileToProcess, quality);
          }
          
          fileToProcess = compressed;
          console.log(`Compressed to: ${fileToProcess.size / 1024}KB`);
        } catch (e) {
          console.warn("Compression failed, trying original file", e);
        }
      }
      
      if (onProgress) onProgress(40);
      
      data = await fileToBase64(fileToProcess);
      isBase64 = true;
      fileName = fileOrUrl.name;
      
      // Final check for base64 size (approx 1.33x file size)
      if (data.length > 1000000) {
        throw new Error("File is too large for Firestore even after compression. Please use a smaller image or a URL.");
      }
      
      if (onProgress) onProgress(60);
    }

    // Save to Firestore
    if (onProgress) onProgress(80);
    
    const docRef = await addDoc(collection(db, "memes"), {
      data,
      uploadedBy: walletAddress,
      type: mediaType,
      fileName: fileName || null, // Firestore doesn't accept undefined
      isBase64,
      uploadedAt: serverTimestamp(),
    });

    if (onProgress) onProgress(100);

    return docRef.id;
  } catch (error) {
    console.error("Error uploading meme:", error);
    throw error;
  }
}

/**
 * Fetch all memes from Firestore
 * @returns Promise with array of memes
 */
export async function fetchMemes(): Promise<Meme[]> {
  try {
    const q = query(collection(db, "memes"), orderBy("uploadedAt", "desc"));
    const querySnapshot = await getDocs(q);

    const memes: Meme[] = [];
    querySnapshot.forEach((doc) => {
      const docData = doc.data();
      memes.push({
        id: doc.id,
        data: docData.data,
        type: docData.type,
        uploadedBy: docData.uploadedBy,
        uploadedAt: docData.uploadedAt,
        fileName: docData.fileName,
        isBase64: docData.isBase64,
      });
    });

    return memes;
  } catch (error) {
    console.error("Error fetching memes:", error);
    return [];
  }
}

/**
 * Subscribe to real-time meme updates
 * @param callback - Function to call when memes update
 * @returns Unsubscribe function
 */
export function subscribeMemes(callback: (memes: Meme[]) => void): () => void {
  const q = query(collection(db, "memes"), orderBy("uploadedAt", "desc"));

  return onSnapshot(
    q,
    (querySnapshot) => {
      const memes: Meme[] = [];
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        memes.push({
          id: doc.id,
          data: docData.data,
          type: docData.type,
          uploadedBy: docData.uploadedBy,
          uploadedAt: docData.uploadedAt,
          fileName: docData.fileName,
          isBase64: docData.isBase64,
        });
      });
      callback(memes);
    },
    (error) => {
      console.error("Error in meme subscription:", error);
      callback([]);
    }
  );
}
