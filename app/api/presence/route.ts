import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Simulated live presence baseline count with smooth natural variations
let baseCount = 36;
let lastUpdate = Date.now();

export async function GET() {
  const now = Date.now();
  // Fluctuate count smoothly every 8 seconds
  if (now - lastUpdate > 8000) {
    const delta = Math.floor(Math.random() * 5) - 2; // -2, -1, 0, 1, 2
    baseCount = Math.max(24, Math.min(68, baseCount + delta));
    lastUpdate = now;
  }

  return NextResponse.json({
    online: baseCount,
    timestamp: now,
    status: "ok",
  });
}
