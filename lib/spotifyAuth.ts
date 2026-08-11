"use client";

const SPOTIFY_SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-read-playback-state",
  "user-modify-playback-state",
].join(" ");

function generateRandomString(length: number): string {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
}

function base64urlencode(a: ArrayBuffer): string {
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(a))))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function initiateSpotifyLogin(): Promise<void> {
  if (typeof window === "undefined") return;

  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "7vnd8GlKrfazw3sUQ8gt0q";
  const redirectUri = `${window.location.origin}/`;

  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64urlencode(hashed);

  localStorage.setItem("spotify_code_verifier", codeVerifier);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: SPOTIFY_SCOPES,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function handleSpotifyAuthCallback(code: string): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const codeVerifier = localStorage.getItem("spotify_code_verifier");
  if (!codeVerifier) return null;

  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "7vnd8GlKrfazw3sUQ8gt0q";
  const redirectUri = `${window.location.origin}/`;

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      console.warn("[Spotify OAuth] Token exchange failed:", response.status);
      return null;
    }

    const data = await response.json();
    if (data.access_token) {
      localStorage.setItem("spotify_access_token", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("spotify_refresh_token", data.refresh_token);
      }
      localStorage.setItem("spotify_token_expiry", (Date.now() + data.expires_in * 1000).toString());
      localStorage.removeItem("spotify_code_verifier");
      return data.access_token;
    }
  } catch (err) {
    console.warn("[Spotify OAuth] Error exchanging code:", err);
  }

  return null;
}

export function getStoredSpotifyToken(): string | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("spotify_access_token");
  const expiry = localStorage.getItem("spotify_token_expiry");

  if (!token || !expiry) return null;

  if (Date.now() > parseInt(expiry, 10)) {
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_token_expiry");
    return null;
  }

  return token;
}
