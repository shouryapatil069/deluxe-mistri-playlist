"use client";

import { useState, useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (IFrameAPI: SpotifyIFrameAPI) => void;
    SpotifyIframeApi?: SpotifyIFrameAPI;
  }
}

export interface SpotifyIFrameAPI {
  createController: (
    element: HTMLElement | null,
    options: {
      uri: string;
      width?: string | number;
      height?: string | number;
    },
    callback: (EmbedController: SpotifyEmbedController) => void
  ) => void;
}

export interface SpotifyEmbedController {
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  loadUri: (spotifyUri: string) => void;
  addListener: (event: string, callback: (e: { data: SpotifyPlaybackUpdateData }) => void) => void;
  removeListener: (event: string, callback?: (e: any) => void) => void;
  destroy: () => void;
}

export interface SpotifyPlaybackUpdateData {
  isPaused: boolean;
  isBuffering: boolean;
  position: number; // ms
  duration: number; // ms
}

export function useSpotifyEmbed(playlistUri: string = "spotify:playlist:7vnd8GlKrfazw3sUQ8gt0q") {
  const [controller, setController] = useState<SpotifyEmbedController | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let isMounted = true;

    const initController = (IFrameAPI: SpotifyIFrameAPI) => {
      console.log("Spotify IFrame API loaded");
      const element = document.getElementById("spotify-embed-iframe");
      if (!element) return;

      const options = {
        uri: playlistUri,
        width: "100%",
        height: "152",
      };

      IFrameAPI.createController(element, options, (EmbedController) => {
        if (!isMounted) return;

        console.log("Spotify controller created");
        controllerRef.current = EmbedController;
        setController(EmbedController);
        setIsReady(true);
        console.log("Spotify playback ready");

        EmbedController.addListener("playback_update", (e) => {
          if (!isMounted || !e || !e.data) return;
          const { isPaused, position, duration } = e.data;
          setIsPlaying(!isPaused);
          setCurrentTime(Math.round(position / 1000));
          if (duration > 0) {
            setDuration(Math.round(duration / 1000));
          }
        });
      });
    };

    if (window.SpotifyIframeApi) {
      initController(window.SpotifyIframeApi);
    } else {
      window.onSpotifyIframeApiReady = (IFrameAPI) => {
        window.SpotifyIframeApi = IFrameAPI;
        if (isMounted) initController(IFrameAPI);
      };

      if (!document.getElementById("spotify-iframe-api-script")) {
        const script = document.createElement("script");
        script.id = "spotify-iframe-api-script";
        script.src = "https://open.spotify.com/embed/iframe-api/v1";
        script.async = true;
        document.body.appendChild(script);
      }
    }

    return () => {
      isMounted = false;
      if (controllerRef.current) {
        try {
          controllerRef.current.destroy();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [playlistUri]);

  const play = useCallback(() => {
    console.log("Spotify play requested");
    if (controllerRef.current) {
      try {
        controllerRef.current.play();
      } catch (e) {
        console.error("Spotify play error:", e);
      }
    }
  }, []);

  const pause = useCallback(() => {
    console.log("Spotify pause requested");
    if (controllerRef.current) {
      try {
        controllerRef.current.pause();
      } catch (e) {
        console.error("Spotify pause error:", e);
      }
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (controllerRef.current) {
      try {
        controllerRef.current.togglePlay();
      } catch (e) {
        console.error("Spotify togglePlay error:", e);
      }
    }
  }, []);

  const seek = useCallback((seconds: number) => {
    if (controllerRef.current) {
      try {
        controllerRef.current.seek(seconds);
        setCurrentTime(seconds);
      } catch (e) {
        console.error("Spotify seek error:", e);
      }
    }
  }, []);

  const loadUri = useCallback((spotifyUri: string) => {
    if (controllerRef.current) {
      try {
        controllerRef.current.loadUri(spotifyUri);
      } catch (e) {
        console.error("Spotify loadUri error:", e);
      }
    }
  }, []);

  return {
    controller,
    isReady,
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    togglePlay,
    seek,
    loadUri,
  };
}
