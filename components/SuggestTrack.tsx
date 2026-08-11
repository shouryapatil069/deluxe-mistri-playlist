"use client";

interface SuggestTrackProps {
  email?: string;
}

export function SuggestTrack({ email = "suggest@mistriplaylist.wtf" }: SuggestTrackProps) {
  return (
    <div className="w-full flex justify-center pt-1 pb-0.5 z-20 pointer-events-auto">
      <a
        href={`mailto:${email}?subject=Mistri Playlist - Track Suggestion`}
        className="text-[10.5px] text-white opacity-45 hover:opacity-80 transition-opacity font-sans tracking-wide underline underline-offset-2 focus:outline-none"
        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
      >
        Suggest a track ✉
      </a>
    </div>
  );
}
