"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Share2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { isConvexConfigured } from "@/lib/convex/config";

export function ReferralCodeInput() {
  const redeem = useMutation(api.referrals.redeem);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  if (!isConvexConfigured()) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setStatus("loading");
    try {
      const result = await redeem({ referralCode: code.trim() });
      if (result && "error" in result) {
        setStatus("error");
        setMessage(result.error ?? "Invalid code");
      } else {
        setStatus("done");
        setMessage("Referral applied! Points awarded to your referrer.");
        setCode("");
      }
    } catch {
      setStatus("error");
      setMessage("Could not apply referral code.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-4"
    >
      <div className="flex items-center gap-2">
        <Share2 className="h-4 w-4 text-[#39FF88]" />
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-[var(--text-main)]">
          Have a referral code?
        </h3>
      </div>
      <div className="mt-3 flex gap-2">
        <input
          className="form-input flex-1 font-mono uppercase"
          placeholder="BD-XXXXXX"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          type="submit"
          className="btn-secondary shrink-0 !px-4 !py-2 text-sm"
          disabled={status === "loading"}
        >
          Apply
        </button>
      </div>
      {message && (
        <p
          className={`mt-2 text-xs ${status === "done" ? "text-[#39FF88]" : "text-[#FF3B3B]"}`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
