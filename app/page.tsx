"use client";

import { DELUXE_CARPENTER_SCENE } from "@/config/scene";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { SceneBackground } from "@/components/SceneBackground";
import { TopBar } from "@/components/TopBar";
import { HeroTitle } from "@/components/HeroTitle";
import { FloatingPlayerPill } from "@/components/FloatingPlayerPill";
import { SuggestTrack } from "@/components/SuggestTrack";
import { YouTubePlayerHost } from "@/components/YouTubePlayerHost";

export default function DeluxeCarpenterPage() {
  const scene = DELUXE_CARPENTER_SCENE;

  const ytPlayer = useYouTubePlayer({
    playlistId: scene.youtubePlaylistId,
  });

  // Keyboard shortcut listeners
  useKeyboardShortcuts({
    onTogglePlay: ytPlayer.togglePlay,
    onNextTrack: ytPlayer.nextTrack,
    onPreviousTrack: ytPlayer.previousTrack,
    onSeekBackward: () => ytPlayer.seekTo(Math.max(0, ytPlayer.currentTime - 5)),
    onSeekForward: () => ytPlayer.seekTo(Math.min(ytPlayer.duration, ytPlayer.currentTime + 5)),
  });

  return (
    <main className="scene relative w-screen h-[100dvh] overflow-hidden select-none">
      {/* 1. Viewport Artwork Background (No text / No UI in asset) */}
      <SceneBackground src={scene.bgImage} alt={scene.description} />

      {/* 2. Ambient Top Bar */}
      <TopBar
        spotifyUrl={scene.externalLinks.spotify}
        ytMusicUrl={scene.externalLinks.ytMusic}
      />

      {/* 3. Hero Identity Title ("डीलक्स मिस्त्री प्लेलिस्ट") */}
      <HeroTitle lines={scene.titleDevanagari} />

      {/* 4. Bottom Floating Player Pill & Track Suggestion */}
      <div className="fixed bottom-[40px] sm:bottom-[55px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20 w-full px-3">
        <FloatingPlayerPill
          currentTrack={ytPlayer.currentTrack}
          isPlaying={ytPlayer.isPlaying}
          currentTime={ytPlayer.currentTime}
          duration={ytPlayer.duration}
          onTogglePlay={ytPlayer.togglePlay}
          onNextTrack={ytPlayer.nextTrack}
          onPreviousTrack={ytPlayer.previousTrack}
          onSeek={ytPlayer.seekTo}
        />
        <SuggestTrack email={scene.suggestEmail} />
      </div>

      {/* Official YouTube Player Debug Host */}
      <YouTubePlayerHost />
    </main>
  );
}
