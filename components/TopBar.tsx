"use client";

import { useState, useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

interface TopBarProps {
  spotifyUrl: string;
  ytMusicUrl: string;
}

export function TopBar({ spotifyUrl, ytMusicUrl }: TopBarProps) {
  const [timeString, setTimeString] = useState<string>("");
  const [onlineCount, setOnlineCount] = useState<number>(36);

  // Live local clock updating every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now
        .toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .toLowerCase();
      setTimeString(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Presence polling
  useEffect(() => {
    const fetchPresence = async () => {
      try {
        const res = await fetch("/api/presence");
        if (res.ok) {
          const data = await res.json();
          if (data.online) setOnlineCount(data.online);
        }
      } catch {
        // preserve current count
      }
    };

    fetchPresence();
    const interval = setInterval(fetchPresence, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleOutboundClick = (platform: "spotify" | "ytmusic", url: string) => {
    trackEvent({
      name: "outbound_click",
      properties: { platform, url },
    });
  };

  return (
    <header className="fixed top-[28px] sm:top-[30px] left-[24px] sm:left-[28px] right-[24px] sm:right-[30px] flex items-center justify-between z-10 pointer-events-auto select-none">
      {/* Top Left: Current Local Time */}
      <div className="flex items-center">
        <span
          className="font-mono text-white/90 text-xs sm:text-sm font-medium tracking-tight"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
        >
          {timeString || "9:43 pm"}
        </span>
      </div>

      {/* Top Center: Online Status (Centred relative to viewport) */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none">
        <span className="relative flex h-2 w-2">
          <span className="motion-safe:animate-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span
          className="text-white/85 text-xs font-sans font-normal tracking-wide"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
        >
          {onlineCount} online
        </span>
      </div>

      {/* Top Right: Spotify ↗ & YT Music ↗ Links */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Spotify Link */}
        <a
          href={spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleOutboundClick("spotify", spotifyUrl)}
          className="group inline-flex items-center gap-1 text-white/80 hover:text-white text-xs font-sans font-medium transition-opacity focus:outline-none"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
          aria-label="Open Spotify playlist"
        >
          <svg className="w-3.5 h-3.5 fill-current text-white/80 group-hover:text-emerald-400 transition-colors" viewBox="0 0 24 24">
            <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm5.521 17.341c-.219.359-.693.475-1.052.257-2.879-1.758-6.502-2.155-10.771-1.18-.407.093-.815-.162-.908-.569-.093-.407.162-.815.569-.908 4.673-1.067 8.677-.611 11.909 1.36.359.218.475.692.253 1.04zm1.472-3.275c-.276.449-.867.592-1.316.316-3.294-2.023-8.318-2.61-12.217-1.426-.502.152-1.033-.139-1.185-.641-.152-.502.139-1.033.641-1.185 4.453-1.353 9.992-.697 13.761 1.619.449.276.592.867.316 1.317zm.147-3.418C15.228 8.49 8.877 8.275 5.168 9.401c-.604.183-1.242-.164-1.425-.768-.183-.604.164-1.242.768-1.425 4.256-1.292 11.272-1.041 15.6 1.529.544.323.722 1.026.4 1.57-.324.543-1.026.721-1.57.4z"/>
          </svg>
          <span className="inline">Spotify</span>
          <span className="text-white/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-xs">↗</span>
        </a>

        {/* YT Music Link */}
        <a
          href={ytMusicUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleOutboundClick("ytmusic", ytMusicUrl)}
          className="group inline-flex items-center gap-1 text-white/80 hover:text-white text-xs font-sans font-medium transition-opacity focus:outline-none"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
          aria-label="Open YouTube Music playlist"
        >
          <svg className="w-3.5 h-3.5 fill-current text-white/80 group-hover:text-red-400 transition-colors" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
          </svg>
          <span className="inline">YT Music</span>
          <span className="text-white/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-xs">↗</span>
        </a>
      </div>
    </header>
  );
}
