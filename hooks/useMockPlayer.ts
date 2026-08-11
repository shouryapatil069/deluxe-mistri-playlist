"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Track } from "@/lib/audio/types";

interface UseMockPlayerOptions {
  tracks: Track[];
  initialTrackIndex?: number;
}

export function useMockPlayer({ tracks, initialTrackIndex = 0 }: UseMockPlayerOptions) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(initialTrackIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];
  const duration = currentTrack.duration || 300;

  const currentTrackIndexRef = useRef(currentTrackIndex);
  const isPlayingRef = useRef(isPlaying);
  const currentTimeRef = useRef(currentTime);
  const durationRef = useRef(duration);

  currentTrackIndexRef.current = currentTrackIndex;
  isPlayingRef.current = isPlaying;
  currentTimeRef.current = currentTime;
  durationRef.current = duration;

  // Mock progress timer advancing when playing
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prevTime) => {
          const nextTime = prevTime + 0.5;
          if (nextTime >= durationRef.current) {
            // Auto-advance to next track and loop
            const nextIndex = (currentTrackIndexRef.current + 1) % tracks.length;
            setCurrentTrackIndex(nextIndex);
            return 0;
          }
          return nextTime;
        });
      }, 500);
    } else {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, tracks.length]);

  const playTrackAtIndex = useCallback(
    (index: number) => {
      const targetIndex = (index + tracks.length) % tracks.length;
      setCurrentTrackIndex(targetIndex);
      setCurrentTime(0);
      setIsPlaying(true);
    },
    [tracks.length]
  );

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const nextTrack = useCallback(() => {
    playTrackAtIndex(currentTrackIndex + 1);
  }, [currentTrackIndex, playTrackAtIndex]);

  const previousTrack = useCallback(() => {
    playTrackAtIndex(currentTrackIndex - 1);
  }, [currentTrackIndex, playTrackAtIndex]);

  const seekTo = useCallback((seconds: number) => {
    const clampedSeconds = Math.max(0, Math.min(seconds, durationRef.current));
    setCurrentTime(clampedSeconds);
  }, []);

  return {
    currentTrack,
    currentTrackIndex,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    nextTrack,
    previousTrack,
    seekTo,
  };
}
