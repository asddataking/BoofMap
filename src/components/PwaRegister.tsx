"use client";

import { useEffect } from "react";
import { isProductionHostname } from "@/lib/site";

function isVercelPreviewHost(hostname: string): boolean {
  // Per-deployment URLs: project-hash-team.vercel.app (many segments)
  if (!hostname.endsWith(".vercel.app")) return false;
  return hostname.split("-").length > 4;
}

function shouldRegisterServiceWorker(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  if (typeof window === "undefined") return true;

  const { hostname } = window.location;
  if (isVercelPreviewHost(hostname)) return false;

  const configuredSite = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredSite) {
    try {
      const siteHost = new URL(configuredSite).hostname;
      return (
        hostname === siteHost ||
        (siteHost === "www.boofmap.com" && hostname === "boofmap.com")
      );
    } catch {
      return isProductionHostname(hostname);
    }
  }

  return isProductionHostname(hostname);
}

async function clearStaleServiceWorkers() {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((r) => r.unregister()));
  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => k.startsWith("boofmap-")).map((k) => caches.delete(k))
    );
  }
}

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const setup = async () => {
      if (!shouldRegisterServiceWorker()) {
        await clearStaleServiceWorkers();
        return;
      }

      try {
        await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
      } catch (err) {
        console.warn("Service worker registration failed", err);
      }
    };

    if (document.readyState === "complete") {
      void setup();
    } else {
      window.addEventListener("load", () => void setup(), { once: true });
    }
  }, []);

  return null;
}
