"use client";

import Image from "next/image";

interface SceneBackgroundProps {
  src: string;
  alt: string;
}

export function SceneBackground({ src, alt }: SceneBackgroundProps) {
  return (
    <div className="fixed inset-0 w-full h-full z-0 select-none overflow-hidden bg-[#271915]">
      {/* Workshop Illustration Background Artwork */}
      <Image
        src={src}
        alt={alt}
        fill
        priority
        className="object-cover object-center w-full h-full"
        quality={98}
      />
      {/* Minimal Readability Gradient Overlay */}
      <div
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,.08), transparent 25%, transparent 70%, rgba(0,0,0,.12))",
        }}
      />
    </div>
  );
}
