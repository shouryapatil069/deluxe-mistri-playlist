"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getStoredSpotifyToken } from "@/lib/spotifyAuth";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      }) => SpotifySDKPlayer;
    };
  }
}

export interface SpotifySDKPlayer {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  addListener: (event: string, callback: (data: any) => void) => void;
  removeListener: (event: string, callback?: (data: any) => void) => void;
  getCurrentState: () => Promise<any>;
  setVolume: (volume: number) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  previousTrack: () => Promise<void>;
  nextTrack: () => Promise<void>;
}

export function useSpotifyPlayer() {
  const [player, setPlayer] = useState<SpotifySDKPlayer | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [premiumRequired, setPremiumRequired] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = getStoredSpotifyToken();
    setToken(storedToken);
    if (storedToken) {
      console.log("Spotify authenticated");
    }
  }, []);

  // Load Spotify Web Playback SDK
  useEffect(() => {
    if (typeof window === "undefined" || !token) return;

    let isMounted = true;

    const loadSdk = () => {
      if (window.Spotify && window.Spotify.Player) {
        console.log("Spotify SDK loaded");
        initPlayer();
        return;
      }

      window.onSpotifyWebPlaybackSDKReady = () => {
        console.log("Spotify SDK loaded");
        if (isMounted) initPlayer();
      };

      if (!document.getElementById("spotify-sdk-script")) {
        const script = document.createElement("script");
        script.id = "spotify-sdk-script";
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);
      }
    };

    const initPlayer = () => {
      if (!window.Spotify || !window.Spotify.Player) return;

      const sdkPlayer = new window.Spotify.Player({
        name: "Deluxe Mistri Player",
        getOAuthToken: (cb) => {
          const freshToken = getStoredSpotifyToken() || token || "";
          cb(freshToken);
        },
        volume: 0.8,
      });

      sdkPlayer.addListener("ready", ({ device_id }) => {
        if (!isMounted) return;
        console.log("Spotify device ready:", device_id);
        setDeviceId(device_id);
        setIsReady(true);
        setPremiumRequired(false);

        // Explicitly set normal initial volume
        sdkPlayer.setVolume(0.8).catch(() => {});

        // Transfer playback active device
        fetch("https://api.spotify.com/v1/me/player", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            device_ids: [device_id],
            play: false,
          }),
        }).catch((err) => {
          console.warn("[Spotify SDK] Transfer playback error:", err);
        });
      });

      sdkPlayer.addListener("not_ready", ({ device_id }) => {
        console.warn("[Spotify SDK] Device not ready:", device_id);
        if (!isMounted) return;
        setIsReady(false);
      });

      sdkPlayer.addListener("player_state_changed", (state) => {
        if (!isMounted || !state) return;
        setIsPlaying(!state.paused);
        setCurrentTime(Math.round(state.position / 1000));
        setDuration(Math.round(state.duration / 1000));
      });

      sdkPlayer.addListener("account_error", (e) => {
        console.error("[Spotify SDK COMPLETE ERROR] account_error:", e);
        if (isMounted) setPremiumRequired(true);
      });

      sdkPlayer.addListener("authentication_error", (e) => {
        console.error("[Spotify SDK COMPLETE ERROR] authentication_error:", e);
        if (isMounted) setIsReady(false);
      });

      sdkPlayer.addListener("initialization_error", (e) => {
        console.error("[Spotify SDK COMPLETE ERROR] initialization_error:", e);
      });

      sdkPlayer.addListener("playback_error", (e) => {
        console.error("[Spotify SDK COMPLETE ERROR] playback_error:", e);
      });

      sdkPlayer.connect().then((success) => {
        if (success) {
          console.log("Spotify player connected successfully");
        } else {
          console.warn("Spotify player failed to connect");
        }
      });

      setPlayer(sdkPlayer);
    };

    loadSdk();

    return () => {
      isMounted = false;
      if (player) {
        player.disconnect();
      }
    };
  }, [token]);

  const playSpotifyUri = useCallback(
    async (spotifyUri: string) => {
      console.log("Play requested");
      console.log("Track URI:", spotifyUri);

      if (!token || !deviceId) {
        console.warn("[Spotify SDK] Cannot play: No token or deviceId ready");
        return false;
      }

      try {
        const response = await fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              uris: [spotifyUri],
            }),
          }
        );

        if (response.ok || response.status === 204) {
          if (player) {
            const state = await player.getCurrentState();
            if (state) {
              console.log("[Spotify SDK] Current playback state:", state);
              setIsPlaying(!state.paused);
            } else {
              console.warn("[Spotify SDK] Playback device not active/connected (state is null)");
            }
          }
          return true;
        } else if (response.status === 403) {
          console.warn("[Spotify SDK] 403 Forbidden: Spotify Premium required");
          setPremiumRequired(true);
        } else {
          const errText = await response.text();
          console.error(`[Spotify SDK COMPLETE ERROR] Play API returned status ${response.status}:`, errText);
        }
      } catch (err) {
        console.error("[Spotify SDK COMPLETE ERROR] Play URI error:", err);
      }

      return false;
    },
    [token, deviceId, player]
  );

  const togglePlay = useCallback(async () => {
    if (!player) return;
    try {
      await player.togglePlay();
      const state = await player.getCurrentState();
      if (state) {
        setIsPlaying(!state.paused);
      }
    } catch (e) {
      console.error("[Spotify SDK COMPLETE ERROR] togglePlay error:", e);
    }
  }, [player]);

  const seek = useCallback(
    async (seconds: number) => {
      if (!player) return;
      try {
        await player.seek(seconds * 1000);
        setCurrentTime(seconds);
      } catch (e) {
        console.error("[Spotify SDK COMPLETE ERROR] seek error:", e);
      }
    },
    [player]
  );

  return {
    player,
    deviceId,
    isReady,
    isPlaying,
    currentTime,
    duration,
    premiumRequired,
    token,
    playSpotifyUri,
    togglePlay,
    seek,
  };
}
