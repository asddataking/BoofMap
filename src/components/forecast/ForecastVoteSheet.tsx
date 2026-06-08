"use client";

import { useState } from "react";
import { SignInButton } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { BottomSheet } from "@/components/BottomSheet";
import { useAuth } from "@/components/BoofAuthProvider";
import { useVoteOnForecast } from "@/hooks/useForecastPulse";
import type {
  ForecastConfidence,
  ForecastMarket,
  ForecastVoteChoice,
} from "@/lib/intelligence/types";

const CONFIDENCE_OPTIONS: {
  value: ForecastConfidence;
  label: string;
  description: string;
}[] = [
  { value: "low", label: "Low", description: "Casual read" },
  { value: "medium", label: "Medium", description: "Solid conviction" },
  { value: "high", label: "High", description: "Strong signal" },
];

export function ForecastVoteSheet({
  market,
  open,
  onClose,
}: {
  market: ForecastMarket | null;
  open: boolean;
  onClose: () => void;
}) {
  const { isAuthenticated } = useAuth();
  const voteOnForecast = useVoteOnForecast();
  const [vote, setVote] = useState<ForecastVoteChoice | null>(null);
  const [confidence, setConfidence] = useState<ForecastConfidence>("medium");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!market) return null;

  const handleSubmit = async () => {
    if (!vote) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await voteOnForecast({
        marketId: market.id,
        vote,
        confidence,
      });
      if (result && "error" in result && result.error) {
        setError(String(result.error));
      } else {
        setSuccess(true);
        setTimeout(onClose, 1200);
      }
    } catch {
      setError("Failed to submit forecast");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-40"
          >
            <BottomSheet title="Community Forecast">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-3 rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <p className="text-sm font-medium text-[var(--text-main)]">
                {market.question}
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                No money. No payouts. Community intelligence only.
              </p>

              {market.user_vote ? (
                <div className="mt-4 rounded-lg border border-[#39FF88]/30 bg-[#39FF88]/10 p-4 text-sm text-[#39FF88]">
                  You forecasted{" "}
                  <span className="font-bold uppercase">{market.user_vote.vote}</span>{" "}
                  with {market.user_vote.confidence} confidence.
                </div>
              ) : !isAuthenticated ? (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-[var(--text-muted)]">
                    Sign in to submit your forecast and build analyst reputation.
                  </p>
                  <SignInButton mode="modal">
                    <button type="button" className="btn-primary w-full py-3">
                      Sign in to forecast
                    </button>
                  </SignInButton>
                </div>
              ) : success ? (
                <div className="mt-4 rounded-lg border border-[#39FF88]/30 bg-[#39FF88]/10 p-4 text-center text-sm font-semibold text-[#39FF88]">
                  Forecast recorded. Building your analyst profile.
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setVote("yes")}
                      className={`rounded-xl border py-4 font-display text-sm font-bold uppercase tracking-wider transition ${
                        vote === "yes"
                          ? "border-[#39FF88] bg-[#39FF88]/15 text-[#39FF88]"
                          : "border-[var(--border-soft)] text-[var(--text-muted)] hover:border-[#39FF88]/40"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setVote("no")}
                      className={`rounded-xl border py-4 font-display text-sm font-bold uppercase tracking-wider transition ${
                        vote === "no"
                          ? "border-[#FF3B3B] bg-[#FF3B3B]/15 text-[#FF3B3B]"
                          : "border-[var(--border-soft)] text-[var(--text-muted)] hover:border-[#FF3B3B]/40"
                      }`}
                    >
                      No
                    </button>
                  </div>

                  <div>
                    <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Confidence
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {CONFIDENCE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setConfidence(opt.value)}
                          className={`rounded-lg border px-2 py-2 text-center transition ${
                            confidence === opt.value
                              ? "border-[#FFD23F] bg-[#FFD23F]/10 text-[#FFD23F]"
                              : "border-[var(--border-soft)] text-[var(--text-muted)]"
                          }`}
                        >
                          <p className="text-xs font-bold">{opt.label}</p>
                          <p className="text-[10px] opacity-70">{opt.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-[#FF3B3B]">{error}</p>
                  )}

                  <button
                    type="button"
                    disabled={!vote || submitting}
                    onClick={handleSubmit}
                    className="btn-primary w-full py-3 disabled:opacity-50"
                  >
                    {submitting ? "Submitting…" : "Submit Forecast"}
                  </button>
                </div>
              )}
            </BottomSheet>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
