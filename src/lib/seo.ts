import type { Metadata } from "next";
import { BOOFMAP_LOGO, BOOFMAP_SOCIAL_SHARE, TAGLINE } from "./constants";
import {
  CANONICAL_SITE_URL,
  normalizeSiteUrl,
  parsePublicSiteUrl,
} from "./site";

export const SITE_NAME = "BoofMap";
/** First market with live community data; map defaults here until more states roll out. */
export const LAUNCH_STATE = "Michigan";
export const LAUNCH_STATE_ABBR = "MI";

export const SITE_TITLE = `${SITE_NAME} — ${TAGLINE}`;
export const SITE_DESCRIPTION =
  "BoofMap is a community-powered cannabis transparency platform for legal markets across the U.S. Real user reports, product quality signals, batch-level intel, and market analytics — launching in Michigan.";
export const SITE_DESCRIPTION_LONG =
  "Find fire and avoid boof with BoofMap — the cannabis transparency platform for legal and recreational markets. Track quality, value, flavor, effects, and trust with verified community reports, strain and brand analytics, and real-time market intelligence. Built for consumers, not pay-to-play listings. Launching in Michigan, expanding nationwide.";

/** Short reusable copy blocks for on-site messaging and meta snippets. */
export const SEO_COPY_SNIPPETS = {
  tagline: "Community-powered cannabis transparency.",
  legalMarkets: "Built for legal cannabis markets.",
  trackProducts: "Track trusted products across dispensaries.",
  realReports: "Real reports from real consumers.",
  communityIntel: "Cannabis intelligence powered by the community.",
  avoidBadWeed:
    "Helping people avoid bad weed and overpriced products.",
  positioning:
    "BoofMap is a community-powered cannabis transparency platform — not just a dispensary finder.",
  heroSub:
    "Real cannabis reports from real consumers. Track quality, value, flavor, effects, and trust across legal markets.",
} as const;

export const SITE_KEYWORDS = [
  "BoofMap",
  "cannabis transparency",
  "weed transparency",
  "cannabis review app",
  "cannabis quality reports",
  "find good weed",
  "avoid bad weed",
  "find fire avoid boof",
  "dispensary product reviews",
  "real weed reviews",
  "legal cannabis map",
  "cannabis reporting app",
  "weed report card",
  "community cannabis reviews",
  "strain reviews",
  "best dispensary products",
  "cannabis batch reports",
  "cannabis consumer protection",
  "weed quality checker",
  "cannabis analytics",
  "cannabis community intelligence",
  "verified cannabis products",
  "cannabis market transparency",
  "community cannabis intelligence",
  "product quality reporting",
  "consumer trust cannabis",
  "verified cannabis reports",
  "legal cannabis markets",
  "recreational cannabis reviews",
  "Weedmaps alternative",
  "cannabis safety accountability",
  "Michigan cannabis",
  "Michigan dispensary reviews",
  "nationwide cannabis map",
];

export const SEO_FAQ = [
  {
    question: "What is BoofMap?",
    answer:
      "BoofMap is a community-powered cannabis transparency platform for legal and recreational markets across the United States. Real consumers report product quality, flag boof and overpriced product, and share fire finds — with crowd verification, batch-level signals, and market intelligence built for buyers, not paid listings.",
  },
  {
    question: "Is BoofMap just a dispensary finder?",
    answer:
      "No. BoofMap is not a menu app or pay-to-play directory. It is a community cannabis intelligence platform where buyers share verified reports on quality, value, flavor, effects, and trust — helping people find good weed and avoid bad product across legal markets.",
  },
  {
    question: "How is BoofMap different from Weedmaps?",
    answer:
      "Weedmaps focuses on dispensary menus and advertising. BoofMap focuses on cannabis transparency: real weed reviews, quality reports, boof alerts, fire finds, mold warnings, and value signals from the community — with no pay-to-play ranking.",
  },
  {
    question: "Do I need an account to use BoofMap?",
    answer:
      "You can browse the map, reports, brand analytics, and community signals for free without signing up. Create a free account to submit reports, confirm alerts, and contribute to cannabis consumer protection in your market.",
  },
  {
    question: "Which states does BoofMap cover?",
    answer:
      `BoofMap is built for any legal or recreational cannabis state in the U.S. We are launching with live community reports in ${LAUNCH_STATE} first, and expanding to more states as the community grows.`,
  },
  {
    question: "What kind of cannabis reports can I submit?",
    answer:
      "Submit product quality reports on flower, carts, edibles, and more — including batch-level notes on flavor, effects, trim, mold concerns, fake sales, and overpriced product. Community members confirm or dispute reports to build verified cannabis intelligence over time.",
  },
] as const;

/** Indexable homepage sections for semantic SEO content. */
export const SEO_HOME_SECTIONS = [
  {
    id: "cannabis-transparency",
    title: "Cannabis Transparency",
    body: "BoofMap brings weed transparency to legal markets with open community reporting. See what real buyers say about quality, value, and trust before you spend — cannabis market transparency powered by people who actually smoke the product, not brands paying for placement.",
  },
  {
    id: "community-reports",
    title: "Community Reports",
    body: "Every signal starts with a real report from a real consumer. Community cannabis reviews cover strains, brands, batches, and dispensaries — crowd-verified so you get honest weed reviews instead of polished marketing copy.",
  },
  {
    id: "product-intelligence",
    title: "Product Intelligence",
    body: "Track quality, flavor, effects, and value across products and batches. BoofMap turns scattered buyer experiences into cannabis analytics — a weed quality checker and report card for the products people are actually buying right now.",
  },
  {
    id: "legal-market-coverage",
    title: "Legal Market Coverage",
    body: "Built for legal cannabis markets nationwide. BoofMap is a legal cannabis map and reporting app designed to scale across every recreational and medical state — launching in Michigan and expanding as the community grows.",
  },
  {
    id: "consumer-protection",
    title: "Consumer Protection",
    body: "Helping consumers make smarter cannabis purchases. Flag mold concerns, taxed product, fake sales, and weak batches. Cannabis consumer protection works best when the community shares what went wrong — and what is actually fire.",
  },
  {
    id: "batch-level-reporting",
    title: "Batch-Level Reporting",
    body: "Quality varies batch to batch. BoofMap supports cannabis batch reports so you can see whether a specific drop hit or missed — not just whether a brand name looks good on a menu.",
  },
  {
    id: "strain-brand-analytics",
    title: "Strain & Brand Analytics",
    body: "Compare strain reviews and brand track records with community trust scores, trend signals, and verified cannabis product intel. Find best dispensary products based on buyer data — not sponsored rankings.",
  },
  {
    id: "real-time-community-signals",
    title: "Real-Time Community Signals",
    body: "Live map pins, fire finds, boof alerts, and trending reports update continuously. Cannabis community intelligence in real time — like Waze for weed quality, built for tactical buyers who want the signal before the hype.",
  },
] as const;

export function getSiteUrl(): string {
  const fromEnv = parsePublicSiteUrl(process.env.NEXT_PUBLIC_SITE_URL ?? "");
  if (fromEnv) return fromEnv;
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

function resolveShareImage(imagePath: string) {
  if (imagePath === BOOFMAP_LOGO.src) return BOOFMAP_LOGO;
  if (imagePath === BOOFMAP_SOCIAL_SHARE.src) return BOOFMAP_SOCIAL_SHARE;
  return {
    src: imagePath,
    width: BOOFMAP_SOCIAL_SHARE.width,
    height: BOOFMAP_SOCIAL_SHARE.height,
    alt: BOOFMAP_SOCIAL_SHARE.alt,
  };
}

export function buildPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "",
  noIndex = false,
  image = BOOFMAP_SOCIAL_SHARE.src,
}: PageMetaOptions = {}): Metadata {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}${path.startsWith("/") ? path : path ? `/${path}` : ""}`;
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_TITLE;
  const shareImage = resolveShareImage(image);
  const imageUrl = shareImage.src.startsWith("http")
    ? shareImage.src
    : `${siteUrl}${shareImage.src}`;

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
          width: shareImage.width,
          height: shareImage.height,
          alt: shareImage.alt,
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
      "geo.region": "US",
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
    "geo.region": "US",
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
    slogan: TAGLINE,
    areaServed: {
      "@type": "Country",
      name: "United States",
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

export function buildBreadcrumbJsonLd(
  items: { name: string; path: string }[]
) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}

export function buildCollectionPageJsonLd(options: {
  name: string;
  description: string;
  path: string;
}) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: options.name,
    description: options.description,
    url: `${siteUrl}${options.path}`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: siteUrl,
    },
    inLanguage: "en-US",
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
    description: `${brand.name} cannabis brand analytics on BoofMap — ${brand.report_count} community reports, trust score ${brand.trust_score}. Strain reviews and verified product signals from real buyers.`,
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
    description: `Community cannabis reports for ${dispo.name} in ${dispo.city} on BoofMap — dispensary product reviews, quality signals, and verified buyer intel.`,
    address: {
      "@type": "PostalAddress",
      addressLocality: dispo.city,
      addressRegion: LAUNCH_STATE_ABBR,
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
