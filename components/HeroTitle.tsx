"use client";

interface HeroTitleProps {
  lines: string[];
}

export function HeroTitle({ lines }: HeroTitleProps) {
  return (
    <div className="absolute top-[7.5%] sm:top-[8.5%] left-1/2 -translate-x-1/2 w-full max-w-6xl text-center select-none z-10 px-4 pointer-events-none">
      <h1
        className="font-devanagari font-bold text-white text-center leading-[1.05] tracking-[-0.01em] text-[clamp(34px,9vw,56px)] sm:text-[clamp(46px,5.8vw,92px)] flex flex-col items-center gap-1.5 sm:gap-2.5"
        style={{
          color: "#ffffff",
          textShadow: "0 3px 12px rgba(0,0,0,0.35)",
        }}
      >
        {lines.map((line, idx) => (
          <span key={idx} className="block whitespace-nowrap">
            {line}
          </span>
        ))}
      </h1>
    </div>
  );
}
