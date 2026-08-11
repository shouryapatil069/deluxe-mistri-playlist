import { SceneConfig } from "@/lib/audio/types";

export const YOUTUBE_PLAYLIST_ID = "PLy7hMzr3bmYpIb4LHpL13VrjZ4i6T4MQg";
export const YOUTUBE_MUSIC_URL = `https://music.youtube.com/playlist?list=${YOUTUBE_PLAYLIST_ID}`;

export const DELUXE_CARPENTER_SCENE: SceneConfig = {
  id: "deluxe-carpenter",
  titleDevanagari: ["डीलक्स", "मिस्त्री प्लेलिस्ट"],
  titleEnglish: "Deluxe Mistri Playlist",
  description: "90s Bollywood songs from the workshop next door.",
  bgImage: "/images/deluxe-carpenter-bg.webp",
  youtubePlaylistId: YOUTUBE_PLAYLIST_ID,
  youtubeMusicUrl: YOUTUBE_MUSIC_URL,
  spotifyPlaylistId: "7vnd8GlKrfazw3sUQ8gt0q",
  spotifyPlaylistUrl: "https://open.spotify.com/playlist/7vnd8GlKrfazw3sUQ8gt0q",
  externalLinks: {
    spotify: "https://open.spotify.com/playlist/7vnd8GlKrfazw3sUQ8gt0q",
    ytMusic: YOUTUBE_MUSIC_URL,
  },
  suggestEmail: "suggest@mistriplaylist.wtf",
  tracks: [],
};

export const ALL_SCENES: Record<string, SceneConfig> = {
  "deluxe-carpenter": DELUXE_CARPENTER_SCENE,
};

export const DEFAULT_SCENE = DELUXE_CARPENTER_SCENE;
