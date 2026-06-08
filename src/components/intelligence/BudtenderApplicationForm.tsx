"use client";

import { useState } from "react";
import { SignInButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/components/BoofAuthProvider";
import { isConvexConfigured } from "@/lib/convex/config";
import { CITIES } from "@/lib/constants";

export function BudtenderApplicationForm() {
  const { isAuthenticated } = useAuth();
  const existing = useQuery(
    api.profiles.getBudtenderApplication,
    isConvexConfigured() && isAuthenticated ? {} : "skip"
  );
  const submit = useMutation(api.profiles.submitBudtenderApplication);

  const [form, setForm] = useState({
    displayName: "",
    dispensaryName: "",
    city: CITIES[0] as string,
    state: "MI",
    experience: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-6">
        <p className="text-sm text-[var(--text-muted)]">
          Sign in to apply for the Boof Insider Network.
        </p>
        <SignInButton mode="modal">
          <button type="button" className="btn-primary mt-4 px-8 py-3">
            Sign in to apply
          </button>
        </SignInButton>
      </div>
    );
  }

  if (existing?.status === "pending") {
    return (
      <div className="rounded-xl border border-[#FFD23F]/30 bg-[#FFD23F]/5 p-6">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-[#FFD23F]">
          Application under review
        </p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Submitted {existing.created_at ? new Date(existing.created_at).toLocaleDateString() : ""}.
          We&apos;ll notify you when approved.
        </p>
      </div>
    );
  }

  if (existing?.status === "approved") {
    return (
      <div className="rounded-xl border border-[#39FF88]/30 bg-[#39FF88]/5 p-6">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-[#39FF88]">
          Verified Insider
        </p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          You&apos;re an active member of the Boof Insider Network.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isConvexConfigured()) return;
    setStatus("loading");
    try {
      const result = await submit(form);
      if (result && "error" in result) {
        setStatus("error");
      } else {
        setStatus("done");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-6"
    >
      <h3 className="font-display text-lg font-extrabold uppercase tracking-tight text-[var(--text-main)]">
        Apply to Insiders
      </h3>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Verified budtenders get insider status, reporting tools, and leaderboard
        visibility.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="form-label" htmlFor="bt-name">
            Display name
          </label>
          <input
            id="bt-name"
            className="form-input mt-1"
            value={form.displayName}
            onChange={(e) =>
              setForm({ ...form, displayName: e.target.value })
            }
            required
          />
        </div>
        <div>
          <label className="form-label" htmlFor="bt-dispo">
            Dispensary (optional)
          </label>
          <input
            id="bt-dispo"
            className="form-input mt-1"
            value={form.dispensaryName}
            onChange={(e) =>
              setForm({ ...form, dispensaryName: e.target.value })
            }
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="form-label" htmlFor="bt-city">
              City
            </label>
            <select
              id="bt-city"
              className="form-input mt-1"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label" htmlFor="bt-state">
              State
            </label>
            <input
              id="bt-state"
              className="form-input mt-1"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              required
            />
          </div>
        </div>
        <div>
          <label className="form-label" htmlFor="bt-exp">
            Experience (optional)
          </label>
          <textarea
            id="bt-exp"
            className="form-input mt-1 min-h-[80px]"
            value={form.experience}
            onChange={(e) =>
              setForm({ ...form, experience: e.target.value })
            }
            placeholder="Years in cannabis, specialties, why you want to report boof..."
          />
        </div>
      </div>

      <button
        type="submit"
        className="btn-primary mt-6 flex items-center gap-2 px-8 py-3"
        disabled={status === "loading"}
      >
        {status === "loading" && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        Submit application
      </button>

      {status === "done" && (
        <p className="mt-3 text-sm text-[#39FF88]">
          Application submitted. Watch for approval notification.
        </p>
      )}
      {status === "error" && (
        <p className="mt-3 text-sm text-[#FF3B3B]">
          Could not submit. You may already have a pending application.
        </p>
      )}
    </form>
  );
}
