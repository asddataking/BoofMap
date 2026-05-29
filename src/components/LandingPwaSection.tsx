"use client";

import { useEffect, useState } from "react";
import {
  Download,
  Globe,
  RefreshCw,
  Share,
  Shield,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).standalone === true
  );
}

const features = [
  { icon: Globe, label: "No app store" },
  { icon: Shield, label: "Privacy first" },
  { icon: Users, label: "Community powered" },
  { icon: RefreshCw, label: "Always up to date" },
];

export function LandingPwaSection() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  const handleInstall = async () => {
    if (deferred) {
      await deferred.prompt();
      setDeferred(null);
      return;
    }
    if (isIos()) setShowIosHint(true);
  };

  if (isStandalone()) return null;

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-zinc-800/60 bg-zinc-950/80 py-12 lg:py-16"
      aria-label="Install BoofMap"
    >
      <div className="leaf-watermark pointer-events-none absolute inset-0 opacity-[0.04]" />

      <div className="relative mx-auto max-w-2xl px-6 text-center">
        <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
          BoofMap runs right in your browser.
        </h2>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {features.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-emerald-400">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-zinc-500">{label}</span>
            </div>
          ))}
        </div>

        {showIosHint ? (
          <p className="mt-8 flex items-center justify-center gap-2 text-sm text-amber-200/90">
            <Share className="h-4 w-4 shrink-0" />
            Tap Share in Safari, then &quot;Add to Home Screen&quot;.
          </p>
        ) : (
          <button
            type="button"
            onClick={handleInstall}
            className={cn(
              "mt-8 inline-flex w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 text-base font-bold text-black shadow-[0_8px_32px_rgba(16,185,129,0.35)] transition hover:bg-emerald-400 active:scale-[0.98] sm:w-auto"
            )}
          >
            <Download className="h-5 w-5" />
            Add to Home Screen
          </button>
        )}
      </div>
    </section>
  );
}
