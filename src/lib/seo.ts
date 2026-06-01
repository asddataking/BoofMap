import type { Metadata } from "next";
import { BOOFMAP_LOGO, TAGLINE } from "./constants";
import { CANONICAL_SITE_URL, normalizeSiteUrl } from "./site";

export const SITE_NAME = "BoofMap";
export const SITE_TITLE = `${SITE_NAME} — ${TAGLINE}`;
export const SITE_DESCRIPTION =
  "BoofMap is Michigan's community-powered cannabis intel platform. Live map, fire finds, boof alerts, and real reports from real consumers — a free alternative to paid dispensary listings.";
export const SITE_DESCRIPTION_LONG =
  "Find fire and avoid boof with BoofMap. Browse Michigan dispensary and brand intel on an interactive map, read community quality reports, spot mold and taxed product, and report bad batches — no app store, no pay-to-play listings.";

export const SITE_KEYWORDS = [
  "BoofMap",
  "Michigan cannabis",
  "Michigan dispensary map",
  "Michigan weed map",
  "cannabis community reports",
  "dispensary intel Michigan",
  "strain reports Michigan",
  "boof reports",
  "cannabis quality reports",
  "find fire avoid boof",
  "Weedmaps alternative Michigan",
  "cannabis reviews Michigan",
  "dispensary boof alerts",
  "mold cannabis report",
  "taxed weed Michigan",
  "METRC cannabis Michigan",
  "live cannabis map",
  "community cannabis intel",
];

export const SEO_FAQ = [
  {
    question: "What is BoofMap?",
    answer:
      "BoofMap is a community-powered cannabis intel platform for Michigan. Members report product quality, flag boof and taxed product, and share fire finds on a live map — built for consumers, not paid listings.",
  },
  {
    question: "How is BoofMap different from Weedmaps?",
    answer:
      "Weedmaps focuses on dispensary menus and advertising. BoofMap focuses on crowd-sourced quality intel: boof alerts, fire finds, mold warnings, and value signals from real buyers — with no pay-to-play ranking.",
  },
  {
    question: "Do I need an account to use BoofMap?",
    answer:
      "You can browse the map, reports, and brand intel for free without signing up. Create a free account to submit reports and manage alerts from your profile.",
  },
  {
    question: "Is BoofMap only for Michigan?",
    answer:
      "BoofMap is built for the Michigan cannabis community first, with reports tied to cities and dispensaries across the state.",
  },
] as const;

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return normalizeSiteUrl(fromEnv);
  if (process.env.VERCEL_ENV === "production") {
    return CANONICAL_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${normalizeSiteUrl(process.env.VERCEL_URL)}`;
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
  image = BOOFMAP_LOGO.src,
}: PageMetaOptions = {}): Metadata {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}${path.startsWith("/") ? path : path ? `/${path}` : ""}`;
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_TITLE;
  const imageUrl = image.startsWith("http") ? image : `${siteUrl}${image}`;

  return {
    title: pageTitle,
    description,
    keywords: [...SITE_KEYWORDS],
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
          width: BOOFMAP_LOGO.width,
          height: BOOFMAP_LOGO.height,
          alt: BOOFMAP_LOGO.alt,
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
    other: {
      "geo.region": "US-MI",
      "geo.placename": "Michigan",
    },
  };
}

export const rootMetadata: Metadata = {
  ...buildPageMetadata({ description: SITE_DESCRIPTION_LONG }),
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
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "geo.region": "US-MI",
  },
  category: "lifestyle",
};

export function buildWebSiteJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: "Boof Map",
    description: SITE_DESCRIPTION_LONG,
    url: siteUrl,
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/reports?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildOrganizationJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: siteUrl,
    logo: `${siteUrl}/icons/icon-512.png`,
    description: SITE_DESCRIPTION,
    areaServed: {
      "@type": "State",
      name: "Michigan",
    },
    sameAs: [],
  };
}

export function buildWebApplicationJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: siteUrl,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: SITE_DESCRIPTION_LONG,
    browserRequirements: "Requires JavaScript. PWA install supported.",
  };
}

export function buildFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SEO_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildBrandJsonLd(brand: {
  name: string;
  slug: string;
  trust_score: number;
  report_count: number;
  avg_boof_score: number;
}) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: brand.name,
    url: `${siteUrl}/brands/${brand.slug}`,
    description: `${brand.name} cannabis brand intel on BoofMap — ${brand.report_count} community reports, trust score ${brand.trust_score}.`,
    aggregateRating:
      brand.report_count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: brand.avg_boof_score.toFixed(1),
            bestRating: "5",
            worstRating: "1",
            ratingCount: brand.report_count,
          }
        : undefined,
  };
}

export function buildDispensaryJsonLd(dispo: {
  name: string;
  slug: string;
  city: string;
  report_count: number;
  value_score: number;
}) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: dispo.name,
    url: `${siteUrl}/dispensaries/${dispo.slug}`,
    description: `Community intel for ${dispo.name} in ${dispo.city}, Michigan on BoofMap.`,
    address: {
      "@type": "PostalAddress",
      addressLocality: dispo.city,
      addressRegion: "MI",
      addressCountry: "US",
    },
    aggregateRating:
      dispo.report_count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: dispo.value_score.toFixed(1),
            bestRating: "100",
            worstRating: "0",
            ratingCount: dispo.report_count,
          }
        : undefined,
  };
}
