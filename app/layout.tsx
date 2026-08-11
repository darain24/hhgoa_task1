import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  return {
    metadataBase: new URL(origin),
    title: "Frame in Goa — HH Goa 2026 Builder Frames",
    description: "Turn any photo into a personalized HH Goa 2026 builder ID, PFP, or squad frame in seconds.",
    icons: { icon: "/favicon.png", shortcut: "/favicon.png" },
    openGraph: {
      title: "Put your build in the frame.",
      description: "Make your HH Goa 2026 builder frame in seconds. #FrameInGoa",
      type: "website",
      url: origin,
      images: [{ url: `${origin}/og.png`, width: 1792, height: 918, alt: "Your Build. Your Frame. HH Goa 2026." }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Frame in Goa",
      description: "Your build. Your frame. HH Goa 2026.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
