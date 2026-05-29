import type { Metadata } from "next";
import { TAGLINE } from "./constants";

export const SITE_NAME = "BoofMap";
export const SITE_TITLE = `${SITE_NAME} — ${TAGLINE}`;
export const SITE_DESCRIPTION =
  "Real cannabis reports from real people in Michigan. Browse community quality and value reports, spot boof and taxed product, and find fire — no app store required.";
export const SITE_KEYWORDS = [
  "BoofMap",
  "cannabis reports",
  "Michigan dispensary reviews",
  "boof reports",
  "cannabis quality",
  "strain reviews",
  "dispensary ratings",
  "find fire avoid boof",
  "cannabis community",
  "Michigan weed",
];

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

type PageMetaOptions = {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  image?: string;
};

export function buildPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "",
  noIndex = false,
  image = "/icons/icon-512.png",
}: PageMetaOptions = {}): Metadata {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}${path.startsWith("/") ? path : path ? `/${path}` : ""}`;
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_TITLE;
  const imageUrl = image.startsWith("http") ? image : `${siteUrl}${image}`;

  return {
    title: pageTitle,
    description,
    keywords: SITE_KEYWORDS,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: siteUrl }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: SITE_NAME,
      title: pageTitle,
      description,
      images: [
        {
          url: imageUrl,
          width: 512,
          height: 512,
          alt: `${SITE_NAME} — ${TAGLINE}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}

export const rootMetadata: Metadata = {
  ...buildPageMetadata(),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE_NAME,
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  category: "lifestyle",
};

export function buildWebSiteJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/reports?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
