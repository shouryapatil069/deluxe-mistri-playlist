"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Track } from "@/lib/audio/types";

interface FloatingPlayerPillProps {
  currentTrack: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  premiumRequired?: boolean;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPreviousTrack: () => void;
  onSeek: (seconds: number) => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function FloatingPlayerPill({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  premiumRequired = false,
  onTogglePlay,
  onNextTrack,
  onPreviousTrack,
  onSeek,
}: FloatingPlayerPillProps) {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [imgSrc, setImgSrc] = useState<string>(
    currentTrack?.albumArt || "/images/album-fallback.png"
  );

  useEffect(() => {
    if (currentTrack?.albumArt) {
      setImgSrc(currentTrack.albumArt);
    } else {
      setImgSrc("/images/album-fallback.png");
    }
  }, [currentTrack?.albumArt]);

  const handleSeekClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressBarRef.current || duration <= 0) return;
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = clickX / rect.width;
      onSeek(percentage * duration);
    },
    [duration, onSeek]
  );

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="w-[calc(100vw-24px)] sm:w-[min(700px,70vw)] z-20 pointer-events-auto flex flex-col items-center">
      <div
        style={{
          background: "rgba(103, 55, 38, 0.78)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 12px 35px rgba(0,0,0,0.18)",
          borderRadius: "999px",
        }}
        className="relative w-full flex items-center gap-3 sm:gap-4 px-3.5 sm:px-5 py-2.5 sm:py-3 h-[78px] sm:h-[84px] transition-transform duration-150"
      >
        {/* Album Artwork (56-60px circular cover) */}
        <div className="relative flex-shrink-0 w-[52px] h-[52px] sm:w-[58px] sm:h-[58px] rounded-full overflow-hidden border border-white/15 shadow-sm bg-[#271915]">
          <Image
            src={imgSrc}
            alt={currentTrack?.title || "Album Artwork"}
            fill
            className={`object-cover transition-transform duration-700 ${
              isPlaying ? "motion-safe:animate-spin-slow" : ""
            }`}
            style={{ borderRadius: "50%" }}
            unoptimized
            onError={() => setImgSrc("/images/album-fallback.png")}
          />
        </div>

        {/* Track Info & Progress Bar */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5 sm:gap-1">
          {/* Metadata: Title (14px semibold) & Artist (11-12px, ~70% opacity) */}
          <div className="flex flex-col min-w-0 leading-tight">
            <h2 className="text-white font-semibold text-[13px] sm:text-[14px] truncate drop-shadow-sm">
              {currentTrack?.title || "Raju Mistri Playlist"}
            </h2>
            <p className="text-white/70 text-[11px] sm:text-[12px] truncate font-normal">
              {currentTrack?.artist || "YouTube Music"}
            </p>
          </div>

          {/* Thin Progress Line (2-3px) */}
          <div
            ref={progressBarRef}
            onClick={handleSeekClick}
            className="group relative w-full h-3 flex items-center cursor-pointer py-1"
            role="slider"
            aria-label="Seek track position"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
            tabIndex={0}
          >
            {/* Background Line (rgba(255,255,255,.25)) */}
            <div
              className="w-full h-[2.5px] rounded-full overflow-hidden transition-all"
              style={{ background: "rgba(255,255,255,0.25)" }}
            >
              {/* Played Line (rgba(255,255,255,.85)) */}
              <div
                className="h-full rounded-full transition-all duration-75"
                style={{
                  width: `${progressPercent}%`,
                  background: "rgba(255,255,255,0.85)",
                }}
              />
            </div>

            {/* Hover Handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm pointer-events-none"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          {/* Monospace Timestamp Readout (0:01 / 6:01) */}
          <div className="flex items-center text-[10px] font-mono text-white/60 space-x-1 leading-none">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Transport Controls (PREV PLAY NEXT) */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Previous Button */}
          <button
            onClick={onPreviousTrack}
            className="p-1.5 sm:p-2 text-white/70 hover:text-white transition-opacity duration-150 focus:outline-none rounded-full min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Previous track (P)"
          >
            <SkipBack className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" />
          </button>

          {/* White Circular Play/Pause Button (46-50px) */}
          <button
            onClick={onTogglePlay}
            className="w-[44px] h-[44px] sm:w-[48px] sm:h-[48px] rounded-full bg-white text-[#673726] flex items-center justify-center shadow-md hover:scale-[1.04] active:scale-[0.96] transition-transform duration-150 focus:outline-none min-w-[44px] min-h-[44px]"
            aria-label={isPlaying ? "Pause music (Space)" : "Play music (Space)"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current stroke-current" />
            ) : (
              <Play className="w-5 h-5 fill-current stroke-current translate-x-0.5" />
            )}
          </button>

          {/* Next Button */}
          <button
            onClick={onNextTrack}
            className="p-1.5 sm:p-2 text-white/70 hover:text-white transition-opacity duration-150 focus:outline-none rounded-full min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Next track (N)"
          >
            <SkipForward className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" />
          </button>
        </div>
      </div>

      {premiumRequired && (
        <p className="text-[10.5px] text-amber-200/80 text-center mt-1 font-sans tracking-wide">
          Spotify Premium is required for in-browser playback.
        </p>
      )}
    </div>
  );
}
