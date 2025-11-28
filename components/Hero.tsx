"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
    {
    id: 1,
    image: "/home-banner-season-4.webp",
    title: "Season 4 is Here",
    description: "Trade to earn rewards in the new season.",
    buttonText: "Join Now",
    buttonLink: "#",
    align: "left",
  },
    {
    id: 2,
    image: "/home-banner-stacked-yield-usd-new.webp",
    title: "Stacked Yield",
    description: "Earn yield on your SOL assets.",
    buttonText: "Start Earning",
    buttonLink: "#",
    align: "left",
  },

   {
    id: 3,
    image: "/home-banner-stacked-yield-sol-new.webp",
    title: "Stacked Yield",
    description: "Earn yield on your SOL assets.",
    buttonText: "Start Earning",
    buttonLink: "#",
    align: "left",
  },

  {
    id: 4,
    image: "/home-banner-usdt-4.webp",
    title: "Got USDT?",
    description: "Convert to USD with 0 fees and start trading on NomiNomi!",
    buttonText: "Trade USDT",
    buttonLink: "#",
    align: "left", 
  },


   {
    id: 5,
    image: "/home-banner-refer-3.webp",
    title: "Refer Friends",
    description: "Invite friends and earn commissions together.",
    buttonText: "Invite Now",
    buttonLink: "#",
    align: "left",
  },
   {
    id: 6,
    image: "/home-banner-wire-transfers-2.webp",
    title: "Wire Transfers",
    description: "Easy and fast wire transfers now available.",
    buttonText: "Learn More",
    buttonLink: "#",
    align: "left",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-[1400px] mx-auto mt-4 px-6">
      <div className="relative h-[500px] md:h-[350px] w-full rounded-2xl overflow-hidden bg-[#141519] border border-white/5 group">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div 
              className="absolute inset-0 flex flex-col justify-center px-6 md:px-16"
              style={{
                background: "linear-gradient(rgba(17, 19, 22, 0.1), rgba(17, 19, 22, 0.2), rgba(17, 19, 22, 0.25), rgba(17, 19, 22, 0.85))"
              }}
            >
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 max-w-xl">
                {slide.title}
              </h1>
              <p className="text-base md:text-xl text-gray-300 mb-8 max-w-lg">
                {slide.description}
              </p>
              <button className="w-fit px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                {slide.buttonText}
              </button>
            </div>
          </div>
        ))}

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? "bg-white" : "bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
