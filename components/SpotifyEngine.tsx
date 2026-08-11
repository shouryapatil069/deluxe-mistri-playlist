"use client";

interface SpotifyEngineProps {
  isVisible?: boolean;
}

export function SpotifyEngine({ isVisible = true }: SpotifyEngineProps) {
  return (
    <div
      aria-hidden={!isVisible}
      className={
        isVisible
          ? "fixed bottom-[145px] left-1/2 -translate-x-1/2 z-30 w-[min(700px,70vw)] max-w-full rounded-xl overflow-hidden shadow-2xl border border-white/20 bg-black/80 p-2"
          : "fixed top-0 left-0 w-[1px] h-[1px] opacity-0 pointer-events-none overflow-hidden z-[-1]"
      }
    >
      {/* Official Spotify Embed iFrame Container */}
      <iframe
        id="spotify-embed-iframe"
        style={{ borderRadius: "12px" }}
        src="https://open.spotify.com/embed/playlist/7vnd8GlKrfazw3sUQ8gt0q?utm_source=generator"
        width="100%"
        height="152"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="Official Spotify Embed Controller"
      />
    </div>
  );
}
