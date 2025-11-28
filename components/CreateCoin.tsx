"use client";

import { useState, useRef } from "react";
import {
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  Info,
  Activity,
} from "lucide-react";
import Image from "next/image";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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

        {/* Image Upload */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
          <div className="relative aspect-video w-full bg-[var(--input-bg)] rounded-lg overflow-hidden mb-4 group">
            {imagePreview ? (
              <>
                <Image
                  src={imagePreview}
                  alt="Coin preview"
                  fill
                  className="object-cover"
                />
                <button
                  onClick={triggerFileInput}
                  className="absolute bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Replace
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                  onClick={triggerFileInput}
                >
                  <Upload className="w-12 h-12 text-[var(--muted)] mb-4" />
                  <p className="text-[var(--muted)] font-medium">
                    Upload image
                  </p>
                </div>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*,video/*"
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[var(--muted)]">
            <div>
              <div className="flex items-center gap-2 mb-1 text-[var(--foreground)] font-medium">
                <span className="p-1 border border-[var(--border-color)] rounded">
                  <Upload size={14} />
                </span>
                File size and type
              </div>
              <ul className="list-disc list-inside pl-1 space-y-1">
                <li>Image - max 15mb. '.jpg', '.gif' or '.png' recommended</li>
                <li>Video - max 30mb. '.mp4' recommended</li>
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 text-[var(--foreground)] font-medium">
                <span className="p-1 border border-[var(--border-color)] rounded">
                  <Upload size={14} />
                </span>
                Resolution and aspect ratio
              </div>
              <ul className="list-disc list-inside pl-1 space-y-1">
                <li>Image - min. 1000x1000px, 1:1 square recommended</li>
                <li>Video - 16:9 or 9:16, 1080p+ recommended</li>
              </ul>
            </div>
          </div>

          {/* Banner Upload Accordion */}
          <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
            <button
              onClick={() => setShowBannerUpload(!showBannerUpload)}
              className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)] hover:text-blue-500 transition-colors"
            >
              <Upload size={16} />
              Add banner (Optional)
              {showBannerUpload ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            {showBannerUpload && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-sm text-[var(--muted)] mb-4">
                  This will be shown on the coin page in addition to the coin
                  image. images or animated gifs up to 5mb, 3:1 / 1500x500px
                  original. You can only do this when creating the coin, and it
                  cannot be changed later.
                </p>
                <div className="border-2 border-dashed border-[var(--border-color)] rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-[var(--input-bg)] transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-[var(--muted)] mb-3" />
                  <h3 className="font-medium mb-1">Upload file...</h3>
                  <button className="bg-green-400 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-500 transition-colors">
                    Select file
                  </button>
                </div>
              </div>
            )}
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

          {/* Mayhem Mode */}
          <div className="bg-[var(--input-bg)] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center border border-red-500/30">
                <Activity className="text-green-400" size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Mayhem mode</span>
                  <span className="bg-green-400/20 text-green-400 text-xs px-2 py-0.5 rounded-full font-medium">
                    New
                  </span>
                </div>
                <p className="text-sm text-[var(--muted)]">
                  Increased price volume.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsMayhemMode(!isMayhemMode)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                isMayhemMode ? "bg-green-400" : "bg-gray-600"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  isMayhemMode ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <Info size={14} />
            Active for 24h, only set at creation. May increase coin supply.{" "}
            <span className="text-green-400 cursor-pointer hover:underline">
              Learn more
            </span>
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

        <button className="w-full md:w-auto bg-violet-400 text-black font-bold py-3 px-8 rounded-lg hover:bg-violet-500 transition-colors">
          Create coin
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
