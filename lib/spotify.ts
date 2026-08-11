import { Track } from "@/lib/audio/types";
import { FALLBACK_PLAYLIST_TRACKS } from "@/data/playlist-fallback";

// Optional YouTube video ID map for known tracks
const YOUTUBE_ID_MAP: Record<string, string> = {
  "4P4NsWdqLziZpEteU1uFCI": "WvO-N1QGg0c", // Saaton Janam Main Tere
  "5jib3JBR209gQizgISFbrH": "vD2P-N6Suhk", // Chupana Bhi Nahi Aata
  "00wU6YKnzNlavZ1TPpLUlp": "2n3C-T64_K0", // Pehla Nasha
  "0dUbhFM18NyBDDpiktEQLk": "14-O6aLq5iA", // Aankh Marey
  "6T2D4mdJ0qRS0GIZmf5pPU": "tV1c-3Xq-b4", // Ghar Se Nikalte Hi
  "7eMALavv9CgU8R7ETPtDNK": "gA42N10eC90", // Ek Ladki Ko Dekha Toh Aisa Laga
  "0qPXI4a94jSGFBu4VKxwWQ": "24c3N29k4jA", // Chura Ke Dil Mera
  "1QwVVMQ6AglyGK6CgRzkbz": "c25G1e3eFsg", // Tujhe Dekha Toh
  "3jCXRAEQq0J4ai2JOmypRq": "3e5l45e1s2k", // Tum Dil Ki Dhadkan Mein
  "6swiB2EqcDcBS2lojpZlaA": "Wn9K1c1M5nI", // Bahut Pyar Karte Hain
};

interface SpotifyAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyArtist {
  name: string;
}

interface SpotifyImage {
  url: string;
}

interface SpotifyAlbum {
  name: string;
  images: SpotifyImage[];
}

interface SpotifyTrackObject {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  uri: string;
  external_urls?: {
    spotify?: string;
  };
}

interface SpotifyPlaylistItem {
  track: SpotifyTrackObject | null;
}

interface SpotifyPlaylistTracksResponse {
  items: SpotifyPlaylistItem[];
}

async function getSpotifyAccessToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      next: { revalidate: 3600 }, // Cache token server-side for 1 hour
    });

    if (!response.ok) {
      console.warn("[Spotify API] Token fetch failed status:", response.status);
      return null;
    }

    const data: SpotifyAccessTokenResponse = await response.json();
    return data.access_token;
  } catch (error) {
    console.warn("[Spotify API] Token error:", error);
    return null;
  }
}

export async function fetchSpotifyPlaylistTracks(
  playlistId: string
): Promise<{ tracks: Track[]; source: "spotify" | "fallback" }> {
  const token = await getSpotifyAccessToken();

  if (!token) {
    return { tracks: FALLBACK_PLAYLIST_TRACKS, source: "fallback" };
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 3600 }, // Revalidate playlist data every 1 hour
      }
    );

    if (!response.ok) {
      console.warn("[Spotify API] Playlist fetch failed status:", response.status);
      return { tracks: FALLBACK_PLAYLIST_TRACKS, source: "fallback" };
    }

    const data: SpotifyPlaylistTracksResponse = await response.json();

    if (!data.items || !Array.isArray(data.items)) {
      return { tracks: FALLBACK_PLAYLIST_TRACKS, source: "fallback" };
    }

    const tracks: Track[] = data.items
      .filter((item): item is SpotifyPlaylistItem & { track: SpotifyTrackObject } => Boolean(item && item.track && item.track.id))
      .map((item, index) => {
        const t = item.track;
        const artistNames = t.artists.map((a) => a.name);
        const mainArtist = artistNames.join(" & ");
        const albumArt = t.album.images?.[0]?.url || "https://i.scdn.co/image/ab67616d0000b273b53c1a3bb68ce3722a4666f2";
        const fallbackTrack = FALLBACK_PLAYLIST_TRACKS[index];

        return {
          id: t.id,
          title: t.name,
          artist: mainArtist,
          artists: artistNames,
          album: t.album.name,
          albumArt: albumArt,
          duration: Math.round(t.duration_ms / 1000),
          spotifyUri: t.uri || `spotify:track:${t.id}`,
          spotifyUrl: t.external_urls?.spotify || `https://open.spotify.com/track/${t.id}`,
          youtubeId: YOUTUBE_ID_MAP[t.id] || fallbackTrack?.youtubeId || "WvO-N1QGg0c",
        };
      });

    if (tracks.length === 0) {
      return { tracks: FALLBACK_PLAYLIST_TRACKS, source: "fallback" };
    }

    return { tracks, source: "spotify" };
  } catch (error) {
    console.warn("[Spotify API] Error fetching playlist tracks:", error);
    return { tracks: FALLBACK_PLAYLIST_TRACKS, source: "fallback" };
  }
}
