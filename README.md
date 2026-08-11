# Deluxe Carpenter (डीलक्स कारपेंटर) — Mistri Playlist

A single-page nostalgia music web application inspired by Indian roadside carpenter workshops. Part of the **Mistri Playlist** project.

![Deluxe Carpenter Scene](/public/images/deluxe_carpenter_bg.jpg)

## Features

- **Full-Viewport Matte Painting**: High-resolution painterly illustration of a roadside Indian carpenter workshop.
- **Config-Driven Scenes**: Designed via `config/scene.ts` so new scenes (e.g. *Deluxe Barber*, *Deluxe Chai Stall*) can be added seamlessly without touching core layout code.
- **Devanagari Display Typography**: Large signature shop-signage display face (`Yatra One` / Devanagari typography).
- **Glassmorphism Floating Player Pill**: Wide rounded player pill (~64px height) with album art, track title, artist name, scrubbable progress bar, time readout, and transport controls.
- **Audio Engine**:
  - **YouTube IFrame Player API**: Instant licensed out-of-the-box audio fallback driven directly by YouTube/YT Music's official player ToS.
  - **Spotify Web Playback SDK**: Connects with Spotify OAuth Premium tokens when configured.
  - **Zero Self-Hosted Audio Bytes**: All audio streams originate directly from `youtube.com` or `spotify.com`.
- **Live Online Listener Presence Counter**: Dynamic live counter (`● 36 online`) polling `/api/presence` with realistic smooth count fluctuations.
- **Keyboard Hotkeys**: `Space` (Play/Pause), `Left Arrow` / `Right Arrow` (Seek -5s / +5s), `N` (Next Track), `P` (Previous Track).
- **Accessibility & Motion**: Fully responsive layout from 360px up to 4K displays with tap targets ≥44px and `prefers-reduced-motion` compliance.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS + Glassmorphism
- **Fonts**: Google Fonts (`Yatra_One`, `Inter`, `JetBrains_Mono`)
- **Audio SDKs**: YouTube IFrame Player API + Spotify Web Playback SDK
- **Analytics**: Lightweight privacy-friendly event tracking (`lib/analytics.ts`)

---

## Getting Started

### 1. Installation

```bash
npm install
```

### 2. Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

### Spotify SDK Setup (Optional)
To enable official Spotify Web Playback SDK streaming for logged-in Spotify Premium users:
1. Register an application on the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Set your **Redirect URI** to `http://localhost:3000/api/auth/callback/spotify`.
3. Add `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` to `.env.local`.

---

## Swapping Hero Illustration & Adding New Scenes

To swap the background illustration or add a new scene:
1. Place your new 16:9 image asset in `public/images/`.
2. Open `config/scene.ts` and add a new entry to `ALL_SCENES`:

```ts
export const DELUXE_BARBER_SCENE: SceneConfig = {
  id: "deluxe-barber",
  titleDevanagari: ["डीलक्स", "नाई"],
  titleEnglish: "Deluxe Barber",
  subtitle: "Mistri Playlist — Roadside Barber Shop",
  bgImage: "/images/deluxe_barber_bg.jpg",
  theme: { ... },
  externalLinks: { ... },
  tracks: [ ... ],
};
```

---

## Verification & Audio Origin Safety

All playback requests hit official `youtube.com` or `spotify.com` servers. **Zero audio bytes are hosted or served from this app's own origin.**
