"use client";

import { useState } from "react";
import { X, Upload, Link as LinkIcon, Loader2, Image as ImageIcon, Film } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { uploadMeme } from "@/lib/meme";
import { toast } from "sonner";
import Image from "next/image";

interface MemeUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function MemeUpload({ isOpen, onClose, onSuccess }: MemeUploadProps) {
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { walletAddress, isConnected } = useWallet();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm"];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Invalid file type. Please upload an image or video.");
      return;
    }

    setFile(selectedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputUrl = e.target.value;
    setUrl(inputUrl);
    
    // Auto-preview if valid URL
    if (inputUrl.match(/\.(jpeg|jpg|gif|png|webp|mp4|webm)$/i)) {
      setPreview(inputUrl);
    }
  };

  const handleUpload = async () => {
    if (!isConnected || !walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (uploadMethod === "file" && !file) {
      toast.error("Please select a file");
      return;
    }

    if (uploadMethod === "url" && !url) {
      toast.error("Please enter a URL");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileOrUrl = uploadMethod === "file" ? file! : url;
      
      // Upload meme (handles both file->base64 and URL)
      toast.info("Uploading meme...");
      await uploadMeme(fileOrUrl, walletAddress, (progress) => {
        setUploadProgress(progress);
      });

      toast.success("Meme uploaded successfully!");
      
      // Reset form
      setFile(null);
      setUrl("");
      setPreview(null);
      setUploadProgress(0);
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload meme");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setFile(null);
      setUrl("");
      setPreview(null);
      setUploadProgress(0);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
          <h2 className="text-2xl font-bold">Upload Meme</h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="p-2 hover:bg-[var(--hover-bg)] rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Upload Method Tabs */}
          <div className="flex bg-[var(--input-bg)] p-1 rounded-xl border border-[var(--border-color)]">
            <button
              onClick={() => setUploadMethod("file")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                uploadMethod === "file"
                  ? "bg-violet-600 text-white shadow-lg"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <Upload size={16} />
              Upload File
            </button>
            <button
              onClick={() => setUploadMethod("url")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                uploadMethod === "url"
                  ? "bg-violet-600 text-white shadow-lg"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <LinkIcon size={16} />
              Enter URL
            </button>
          </div>

          {/* File Upload */}
          {uploadMethod === "file" && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-[var(--border-color)] rounded-xl p-8 text-center hover:border-violet-500/50 transition-colors">
                <input
                  type="file"
                  accept="image/*,video/*,.gif"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <div className="p-4 bg-violet-500/10 rounded-full">
                    <Upload size={32} className="text-violet-500" />
                  </div>
                  <div>
                    <p className="font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-[var(--muted)] mt-1">
                      Images, GIFs, or Videos (max 10MB)
                    </p>
                  </div>
                </label>
              </div>
              {file && (
                <div className="flex items-center gap-3 p-3 bg-[var(--input-bg)] rounded-lg">
                  {file.type.startsWith("video") ? <Film size={20} /> : <ImageIcon size={20} />}
                  <span className="text-sm flex-1 truncate">{file.name}</span>
                  <span className="text-xs text-[var(--muted)]">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}
            </div>
          )}

          {/* URL Input */}
          {uploadMethod === "url" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Meme URL</label>
              <input
                type="url"
                value={url}
                onChange={handleUrlChange}
                placeholder="https://example.com/meme.gif"
                disabled={isUploading}
                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 outline-none focus:border-violet-500 transition-colors"
              />
              <p className="text-xs text-[var(--muted)]">
                Enter a direct link to an image, GIF, or video
              </p>
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Preview</label>
              <div className="relative aspect-video bg-[var(--input-bg)] rounded-xl overflow-hidden border border-[var(--border-color)]">
                {preview.match(/\.(mp4|webm|mov)$/i) || file?.type.startsWith("video") ? (
                  <video
                    src={preview}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                )}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span className="text-violet-500 font-medium">{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-[var(--input-bg)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Wallet Warning */}
          {!isConnected && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 p-4 rounded-lg text-sm">
              Please connect your wallet to upload memes
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--border-color)]">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="px-6 py-2 rounded-lg border border-[var(--border-color)] hover:bg-[var(--hover-bg)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading || !isConnected || (!file && !url)}
            className="px-6 py-2 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
