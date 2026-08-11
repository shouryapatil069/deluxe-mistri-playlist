import { NextResponse } from "next/server";
import { DELUXE_CARPENTER_SCENE } from "@/config/scene";
import { fetchSpotifyPlaylistTracks } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await fetchSpotifyPlaylistTracks(DELUXE_CARPENTER_SCENE.spotifyPlaylistId);

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
