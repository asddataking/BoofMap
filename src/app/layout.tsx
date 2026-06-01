import type { Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { BoofAuthProvider } from "@/components/BoofAuthProvider";
import { PwaRegister } from "@/components/PwaRegister";
import { SiteJsonLd } from "@/components/SiteJsonLd";
import { rootMetadata } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

export const metadata = rootMetadata;

export const viewport: Viewport = {
  themeColor: "#050807",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${barlowCondensed.variable} h-full`}
    >
      <head>
        <SiteJsonLd />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="apple-touch-startup-image"
          href="/icons/icon-512.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icons/icon-512.png"
          media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)"
        />
      </head>
      <body className="min-h-full antialiased page-gradient">
        <PwaRegister />
        <ClerkProvider>
          <ConvexClientProvider>
            <BoofAuthProvider>{children}</BoofAuthProvider>
          </ConvexClientProvider>
        </ClerkProvider>
        <Analytics />
      </body>
    </html>
  );
}
