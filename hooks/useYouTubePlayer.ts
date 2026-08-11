"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Track } from "@/lib/audio/types";
import { loadYouTubeIframeApi, YTPlayer, YTVideoData } from "@/lib/youtubeSdk";
import { YOUTUBE_PLAYLIST_ID } from "@/config/scene";

interface UseYouTubePlayerOptions {
  playlistId?: string;
}

export function useYouTubePlayer({ playlistId = YOUTUBE_PLAYLIST_ID }: UseYouTubePlayerOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(300);
  const [isReady, setIsReady] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track>({
    id: "yt-default",
    title: "Raju Mistri Playlist",
    artist: "YouTube Music",
    albumArt: "",
    duration: 300,
  });

  const ytPlayerRef = useRef<YTPlayer | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateTrackFromPlayer = useCallback((player: YTPlayer) => {
    try {
      const data: YTVideoData = player.getVideoData();
      const videoId = data.video_id;
      const rawTitle = data.title || "";
      const author = data.author || "";

      let parsedTitle = rawTitle;
      let parsedArtist = author;

      // Clean up common "Artist - Song" or "Song | Artist" title formats
      if (rawTitle.includes("-")) {
        const parts = rawTitle.split("-");
        parsedArtist = parts[0].trim();
        parsedTitle = parts.slice(1).join("-").trim();
      } else if (rawTitle.includes("|")) {
        const parts = rawTitle.split("|");
        parsedTitle = parts[0].trim();
        parsedArtist = parts[1].trim();
      }

      // Remove unwanted suffixes like (Official Video) or [Lyrical]
      parsedTitle = parsedTitle.replace(/\(.*?\)|\[.*?\]/g, "").trim() || rawTitle;

      const trackDuration = player.getDuration() || 300;
      if (trackDuration > 0) {
        setDuration(trackDuration);
      }

      const coverUrl = videoId
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : "";

      setCurrentTrack({
        id: videoId || "yt-current",
        title: parsedTitle || "Raju Mistri Playlist",
        artist: parsedArtist || "YouTube Music",
        albumArt: coverUrl,
        duration: trackDuration,
        youtubeId: videoId,
      });

      console.log("Playlist index:", player.getPlaylistIndex());
      console.log("Video:", data);
    } catch (e) {
      console.error("Error fetching video data:", e);
    }
  }, []);

  // Initialize YouTube Player API in Playlist Mode with proper playerVars & Error 150 handling
  useEffect(() => {
    let isMounted = true;

    loadYouTubeIframeApi().then(() => {
      if (!isMounted) return;
      console.log("YouTube API loaded");

      const playerDiv = document.getElementById("yt-player-hidden");
      if (!playerDiv) return;

      ytPlayerRef.current = new window.YT!.Player("yt-player-hidden", {
        height: "360",
        width: "640",
        playerVars: {
          listType: "playlist",
          list: playlistId,
          playsinline: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          autoplay: 0,
        },
        events: {
          onReady: (event) => {
            if (!isMounted) return;
            console.log("YouTube player ready");
            console.log("Playlist loaded");
            setIsReady(true);

            try {
              event.target.setLoop(true);
            } catch {
              // ignore if loop API not ready
            }

            updateTrackFromPlayer(event.target);
            console.log("Muted:", event.target.isMuted());
            console.log("Volume:", event.target.getVolume());
          },
          onStateChange: (event) => {
            if (!isMounted) return;
            const YTState = window.YT!.PlayerState;
            console.log("Player state:", event.data);

            updateTrackFromPlayer(event.target);

            if (event.data === YTState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === YTState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === YTState.ENDED) {
              try {
                event.target.nextVideo();
              } catch {
                setIsPlaying(false);
              }
            }
          },
          onError: (event) => {
            console.error("YouTube playback error:", event.data);
            switch (event.data) {
              case 150:
              case 101:
                console.error("Error 150: Video cannot be played in embedded player.");
                console.error("Check if the video is embeddable and not region-restricted.");
                // Auto-skip non-embeddable video to next track in playlist
                if (ytPlayerRef.current && typeof ytPlayerRef.current.nextVideo === "function") {
                  try {
                    ytPlayerRef.current.nextVideo();
                  } catch (e) {
                    console.error("Error skipping video:", e);
                  }
                }
                break;
              default:
                console.error("YouTube error:", event.data);
            }
          },
        },
      });
    });

    return () => {
      isMounted = false;
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, [playlistId, updateTrackFromPlayer]);

  // Sync real playback time from YouTube Player every 250ms while playing
  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === "function") {
          try {
            const time = ytPlayerRef.current.getCurrentTime();
            if (time !== undefined && time >= 0) {
              setCurrentTime(time);
            }
          } catch {
            // ignore
          }
        }
      }, 250);
    } else {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    console.log("Play clicked");
    if (!ytPlayerRef.current) {
      console.log("Player not ready yet");
      return;
    }

    if (isPlaying) {
      if (typeof ytPlayerRef.current.pauseVideo === "function") {
        try { ytPlayerRef.current.pauseVideo(); } catch (e) { console.error(e); }
      }
    } else {
      if (typeof ytPlayerRef.current.unMute === "function") {
        try { ytPlayerRef.current.unMute(); } catch (e) { console.error(e); }
      }
      if (typeof ytPlayerRef.current.setVolume === "function") {
        try { ytPlayerRef.current.setVolume(70); } catch (e) { console.error(e); }
      }
      if (typeof ytPlayerRef.current.playVideo === "function") {
        try { ytPlayerRef.current.playVideo(); } catch (e) { console.error(e); }
      }

      if (typeof ytPlayerRef.current.isMuted === "function") {
        console.log("Muted:", ytPlayerRef.current.isMuted());
      }
      if (typeof ytPlayerRef.current.getVolume === "function") {
        console.log("Volume:", ytPlayerRef.current.getVolume());
      }
    }
  }, [isPlaying]);

  const nextTrack = useCallback(() => {
    if (ytPlayerRef.current && typeof ytPlayerRef.current.nextVideo === "function") {
      try {
        ytPlayerRef.current.nextVideo();
      } catch (e) {
        console.error("Next video error:", e);
      }
    }
  }, []);

  const previousTrack = useCallback(() => {
    if (ytPlayerRef.current) {
      try {
        const time = ytPlayerRef.current.getCurrentTime();
        if (time > 3 && typeof ytPlayerRef.current.seekTo === "function") {
          ytPlayerRef.current.seekTo(0, true);
        } else if (typeof ytPlayerRef.current.previousVideo === "function") {
          ytPlayerRef.current.previousVideo();
        }
      } catch (e) {
        console.error("Previous video error:", e);
      }
    }
  }, []);

  const seekTo = useCallback(
    (seconds: number) => {
      const clampedSeconds = Math.max(0, Math.min(seconds, duration));
      setCurrentTime(clampedSeconds);
      if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === "function") {
        try {
          ytPlayerRef.current.seekTo(clampedSeconds, true);
        } catch (e) {
          console.error("Seek error:", e);
        }
      }
    },
    [duration]
  );

  return {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    isReady,
    togglePlay,
    nextTrack,
    previousTrack,
    seekTo,
  };
}
