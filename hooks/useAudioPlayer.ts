"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Track } from "@/lib/audio/types";
import { loadYouTubeIframeApi, YTPlayer } from "@/lib/youtubeSdk";
import { trackEvent } from "@/lib/analytics";

interface UseAudioPlayerOptions {
  tracks: Track[];
  initialTrackIndex?: number;
}

export function useAudioPlayer({ tracks, initialTrackIndex = 0 }: UseAudioPlayerOptions) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(initialTrackIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(tracks[initialTrackIndex]?.duration || 361);
  const [isReady, setIsReady] = useState(false);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];
  const ytPlayerRef = useRef<YTPlayer | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(false);
  const currentTrackIndexRef = useRef(currentTrackIndex);

  isPlayingRef.current = isPlaying;
  currentTrackIndexRef.current = currentTrackIndex;

  const playTrackAtIndex = useCallback(
    (index: number) => {
      const targetIndex = (index + tracks.length) % tracks.length;
      setCurrentTrackIndex(targetIndex);
      const targetTrack = tracks[targetIndex];
      setCurrentTime(0);
      setDuration(targetTrack.duration || 361);

      trackEvent({
        name: "track_play",
        properties: {
          trackId: targetTrack.id,
          trackTitle: targetTrack.title,
          artist: targetTrack.artist,
        },
      });

      const videoId = targetTrack.youtubeId || "uIYFObB-yv0";
      console.log("Video ID:", videoId);

      if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === "function") {
        try {
          ytPlayerRef.current.loadVideoById(videoId);
          if (typeof ytPlayerRef.current.unMute === "function") ytPlayerRef.current.unMute();
          if (typeof ytPlayerRef.current.setVolume === "function") ytPlayerRef.current.setVolume(70);
          if (typeof ytPlayerRef.current.playVideo === "function") ytPlayerRef.current.playVideo();
        } catch (e) {
          console.error("Error loading video:", e);
        }
      }
    },
    [tracks]
  );

  // Initialize YouTube Player API in container
  useEffect(() => {
    let isMounted = true;

    loadYouTubeIframeApi().then(() => {
      if (!isMounted) return;
      console.log("YT API loaded");

      const playerDiv = document.getElementById("yt-player-hidden");
      if (!playerDiv) return;

      const videoId = currentTrack.youtubeId || "uIYFObB-yv0";
      console.log("Video ID:", videoId);

      ytPlayerRef.current = new window.YT!.Player("yt-player-hidden", {
        height: "200",
        width: "320",
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          playsinline: 1,
        },
        events: {
          onReady: (event) => {
            if (!isMounted) return;
            console.log("YT player ready");
            setIsReady(true);
            const playerDuration = event.target.getDuration();
            if (playerDuration > 0) {
              setDuration(playerDuration);
            }
          },
          onStateChange: (event) => {
            if (!isMounted) return;
            console.log("Player state:", event.data);
            const YTState = window.YT!.PlayerState;

            if (event.data === YTState.PLAYING) {
              setIsPlaying(true);
              const realDuration = event.target.getDuration();
              if (realDuration > 0) setDuration(realDuration);
            } else if (event.data === YTState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === YTState.ENDED) {
              setIsPlaying(false);
              trackEvent({
                name: "track_complete",
                properties: {
                  trackId: currentTrackIndexRef.current.toString(),
                  trackTitle: tracks[currentTrackIndexRef.current]?.title || "",
                },
              });
              const nextIndex = (currentTrackIndexRef.current + 1) % tracks.length;
              playTrackAtIndex(nextIndex);
            }
          },
          onError: (event) => {
            console.log("YT error code:", event.data);
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
          // ignore cleanup errors
        }
      }
    };
  }, []);

  // Sync real progress time from YouTube Player
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
    if (ytPlayerRef.current) {
      if (isPlaying) {
        if (typeof ytPlayerRef.current.pauseVideo === "function") {
          try { ytPlayerRef.current.pauseVideo(); } catch (e) { console.error(e); }
        }
        setIsPlaying(false);
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
    } else {
      console.log("Player not initialized yet");
    }
  }, [isPlaying]);

  const nextTrack = useCallback(() => {
    playTrackAtIndex(currentTrackIndex + 1);
  }, [currentTrackIndex, playTrackAtIndex]);

  const previousTrack = useCallback(() => {
    playTrackAtIndex(currentTrackIndex - 1);
  }, [currentTrackIndex, playTrackAtIndex]);

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
        trackEvent({
          name: "track_seek",
          properties: {
            trackId: currentTrack.id,
            seekTo: clampedSeconds,
          },
        });
      }
    },
    [duration, currentTrack]
  );

  return {
    currentTrack,
    currentTrackIndex,
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
