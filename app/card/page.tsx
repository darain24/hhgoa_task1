import type { Metadata } from "next";
import CardClient from "./card-client";

const SITE_URL = "https://hhgoa-task1-xi.vercel.app";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const img = first(params.img);
  const name = first(params.n) || "Builder";
  const id = first(params.id);
  const title = `${name} — HH Goa Builder Card`;
  const description = id
    ? `Builder ID #${id} · Hackers House Goa 2026 · #FrameInGoa`
    : "Hackers House Goa 2026 Builder Card · #FrameInGoa";

  // Serve the generated card through our domain so X can preview it reliably.
  const cardImage = img
    ? `${SITE_URL}/api/og-card?src=${encodeURIComponent(img)}`
    : `${SITE_URL}/og.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/card`,
      type: "website",
      images: [
        {
          url: cardImage,
          width: 1600,
          height: 1000,
          alt: `${name}'s HH Goa builder card`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [cardImage],
    },
  };
}

export default function CardPage() {
  return <CardClient />;
}
