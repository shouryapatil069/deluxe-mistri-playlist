"use client";

import { useEffect } from "react";

interface KeyboardShortcutsOptions {
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPreviousTrack: () => void;
  onSeekBackward: () => void;
  onSeekForward: () => void;
}

export function useKeyboardShortcuts({
  onTogglePlay,
  onNextTrack,
  onPreviousTrack,
  onSeekBackward,
  onSeekForward,
}: KeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keyboard events when user is typing inside input/textarea elements
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          onTogglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          onSeekBackward();
          break;
        case "ArrowRight":
          e.preventDefault();
          onSeekForward();
          break;
        case "KeyN":
          e.preventDefault();
          onNextTrack();
          break;
        case "KeyP":
          e.preventDefault();
          onPreviousTrack();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onTogglePlay, onNextTrack, onPreviousTrack, onSeekBackward, onSeekForward]);
}
