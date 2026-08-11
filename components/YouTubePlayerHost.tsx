"use client";

export function YouTubePlayerHost() {
  return (
    <div style={{ position: "fixed", left: "-9999px", top: "0px" }}>
      <div id="yt-player-hidden" />
    </div>
  );
}
