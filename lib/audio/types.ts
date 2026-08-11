export interface Track {
  id: string;
  title: string;
  artist: string;
  artists?: string[];
  album?: string;
  albumArt: string;
  duration: number; // in seconds
  spotifyUri?: string;
  spotifyUrl?: string;
  youtubeId?: string;
}

export interface SceneConfig {
  id: string;
  titleDevanagari: string[];
  titleEnglish: string;
  description: string;
  bgImage: string;
  youtubePlaylistId?: string;
  youtubeMusicUrl?: string;
  spotifyPlaylistId: string;
  spotifyPlaylistUrl: string;
  externalLinks: {
    spotify: string;
    ytMusic: string;
  };
  suggestEmail?: string;
  tracks: Track[];
}
