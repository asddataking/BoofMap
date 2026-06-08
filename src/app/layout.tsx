import type { Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { BoofAuthProvider } from "@/components/BoofAuthProvider";
import { PwaRegister } from "@/components/PwaRegister";
import { SkipToMain } from "@/components/a11y/SkipToMain";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { SiteJsonLd } from "@/components/SiteJsonLd";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeScript } from "@/components/ThemeScript";
import { FloatingThemeToggle } from "@/components/ThemeToggle";
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
  themeColor: "#fafafa",
  width: "device-width",
  initialScale: 1,
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
      data-theme="light"
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
        <meta name="theme-color" content="#fafafa" />
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
        <SkipToMain />
        <PwaRegister />
        <ThemeProvider>
          <ClerkProvider>
            <ConvexClientProvider>
              <BoofAuthProvider>{children}</BoofAuthProvider>
            </ConvexClientProvider>
          </ClerkProvider>
          <FloatingThemeToggle />
        </ThemeProvider>
        <GoogleAnalytics />
        <Analytics />
      </body>
    </html>
  );
}
