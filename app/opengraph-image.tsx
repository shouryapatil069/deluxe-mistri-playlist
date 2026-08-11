import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "डीलक्स मिस्त्री प्लेलिस्ट — Deluxe Mistri Playlist";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#271915",
          backgroundImage: "linear-gradient(to bottom, #742314, #271915)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontSize: "88px",
              fontWeight: 900,
              letterSpacing: "-2px",
              textShadow: "0 4px 24px rgba(0,0,0,0.6)",
            }}
          >
            डीलक्स मिस्त्री प्लेलिस्ट
          </div>
          <div
            style={{
              fontSize: "32px",
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.9)",
              marginTop: "8px",
            }}
          >
            Deluxe Carpenter — Mistri Playlist
          </div>
          <div
            style={{
              fontSize: "22px",
              color: "rgba(255, 255, 255, 0.7)",
              marginTop: "12px",
            }}
          >
            90s Bollywood songs from the workshop next door.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
