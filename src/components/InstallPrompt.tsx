"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
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

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [dismissed, setDismissed] = useState(false);
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

  if (isStandalone() || dismissed) return null;

  const handleInstall = async () => {
    if (deferred) {
      await deferred.prompt();
      setDeferred(null);
      setDismissed(true);
      return;
    }
    if (isIos()) {
      setShowIosHint(true);
    }
  };

  return (
    <div className="glass-card relative overflow-hidden p-4">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 rounded-lg p-1 text-zinc-500 hover:text-zinc-300"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
          <Download className="h-5 w-5 text-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-semibold text-white">
            Add to Home Screen
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            Install BoofMap for a full-screen, app-like experience — no app
            store needed.
          </p>

          {showIosHint ? (
            <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-200/90">
              <Share className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Tap Share in Safari, then &quot;Add to Home Screen&quot;.
            </p>
          ) : (
            <button
              type="button"
              onClick={handleInstall}
              className={cn(
                "btn-primary mt-3 w-full !py-2.5"
              )}
            >
              Add to Home Screen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
