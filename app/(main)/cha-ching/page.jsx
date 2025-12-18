"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import AutoPlayDemo from "./_components/auto-play-demo";
import RulesCard from "./_components/rules-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";

export default function ChaChingLandingPage() {
  const [showRules, setShowRules] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  // 🎵 Auto-play background music
  useEffect(() => {
    const audio = new Audio("/landing-page-bgm.mp3");
    audio.loop = true;
    audio.volume = 0.6;
    audioRef.current = audio;
    audio.play().catch(() => console.warn("Autoplay blocked."));
    return () => audio.pause();
  }, []);

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioRef.current.muted;
    setIsMuted(audioRef.current.muted);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-sky-100 to-blue-300 flex items-center justify-center">
      {/* Falling demo background */}
      <AutoPlayDemo />

      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-[2px] bg-white/10 z-10" />

      {/* Center content */}
      <motion.div
        className="relative z-20 flex flex-col items-center text-center p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-white/40 shadow-xl backdrop-blur-md border border-white/30 w-[85%] sm:w-[90%] max-w-sm sm:max-w-lg space-y-4 sm:space-y-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.h1
          className="text-3xl sm:text-5xl font-extrabold text-gray-800 drop-shadow-lg leading-tight"
          whileHover={{ scale: 1.03 }}
        >
          💰 Cha-Ching!
        </motion.h1>

        <p className="text-gray-600 text-sm sm:text-lg leading-snug max-w-xs sm:max-w-md">
          Catch the money, avoid the bills. Test your reflexes and see how much
          you can earn before time runs out!
        </p>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Link href="/cha-ching/game" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-4 sm:px-8 sm:py-6 text-base sm:text-lg rounded-xl w-full"
            >
              ▶ Play Now
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => setShowRules(true)}
            className="flex items-center justify-center gap-2 text-gray-700 bg-white/80 hover:bg-white/90 border border-gray-200 px-6 py-4 sm:px-8 sm:py-6 text-base sm:text-lg rounded-xl shadow-sm w-full"
          >
            <Info size={16} />
            How to Play
          </Button>
        </div>

     
      </motion.div>
      {/* 🔊 Global mute toggle (floating button) */}
      <Button
        onClick={toggleMute}
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white/70 hover:bg-white/90 text-gray-700 rounded-full shadow-lg backdrop-blur-md transition-transform active:scale-90 z-30"
        aria-label="Toggle sound"
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </Button>
      
      {/* ⬅️ Back to Dashboard */}
      <Link href="/dashboard">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-14 right-4 sm:top-20 sm:right-6 bg-white/70 hover:bg-white/90 text-gray-700 rounded-full shadow-lg backdrop-blur-md transition-transform active:scale-90 z-30"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </Link>

      {/* Rules popup */}
      {showRules && <RulesCard onClose={() => setShowRules(false)} />}
    </div>
  );
}
