import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://mistriplaylist.wtf"),
  title: "डीलक्स मिस्त्री प्लेलिस्ट — Deluxe Mistri Playlist",
  description: "90s Bollywood songs from the workshop next door.",
  keywords: ["डीलक्स मिस्त्री प्लेलिस्ट", "Deluxe Mistri Playlist", "90s Bollywood Songs", "Indian Workshop Scene", "Nostalgia Music"],
  openGraph: {
    title: "डीलक्स मिस्त्री प्लेलिस्ट — Deluxe Mistri Playlist",
    description: "90s Bollywood songs from the workshop next door.",
    url: "https://mistriplaylist.wtf",
    siteName: "Mistri Playlist",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "डीलक्स मिस्त्री प्लेलिस्ट — Deluxe Mistri Playlist",
    description: "90s Bollywood songs from the workshop next door.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="hi"
      className="h-full overflow-hidden antialiased"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Yatra+One&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full w-full overflow-hidden bg-[#271915] text-white selection:bg-amber-800/40">
        {children}
      </body>
    </html>
  );
}
