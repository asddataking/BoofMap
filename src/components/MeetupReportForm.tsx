"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CITIES,
  MEETUP_DISCLAIMER,
  MEETUP_ISSUE_TAGS,
  MEETUP_TYPES,
  PLATFORMS,
} from "@/lib/constants";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { MeetupReportFormData, MeetupType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuth } from "./BoofAuthProvider";
import { SignInPrompt } from "./SignInPrompt";
import { useReportImageUpload } from "@/lib/storage/r2-upload";
import { Disclaimer } from "./Disclaimer";

const initial: MeetupReportFormData = {
  seller_display_name: "",
  platform: "Telegram",
  city: "Detroit",
  area: "",
  meetup_type: "in-person",
  issue_tags: [],
  notes: "",
};

export function MeetupReportForm({
  onSuccess,
}: {
  onSuccess?: () => void;
} = {}) {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const createMeetupReport = useMutation(api.meetupReports.create);
  const uploadImage = useReportImageUpload();
  const [form, setForm] = useState<MeetupReportFormData>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTag = (tag: string) => {
    setForm((f) => ({
      ...f,
      issue_tags: f.issue_tags.includes(tag)
        ? f.issue_tags.filter((t) => t !== tag)
        : [...f.issue_tags, tag],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError("Sign in to submit a report.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      let imageUrl: string | undefined;
      if (form.image_file) {
        imageUrl =
          (await uploadImage(form.image_file, "meetupReports")) ?? undefined;
      }

      const result = await createMeetupReport({
        sellerDisplayName: form.seller_display_name,
        platform: form.platform,
        city: form.city,
        area: form.area || undefined,
        meetupType: form.meetup_type,
        issueTags: form.issue_tags,
        notes: form.notes || undefined,
        latitude: form.latitude,
        longitude: form.longitude,
        imageUrl,
      });

      if ("error" in result && result.error) throw new Error(result.error);
      if (!("report" in result) || !result.report?.id) throw new Error("Failed to submit");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/reports?tab=meetup");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <p className="py-12 text-center text-sm text-[var(--text-muted)]">Loading…</p>
    );
  }

  if (!isAuthenticated) {
    return (
      <SignInPrompt message="Sign in to report a meetup or seller experience." />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="rounded-xl border border-purple-500/20 bg-purple-500/5 px-3 py-2 text-xs text-purple-200/90">
        {MEETUP_DISCLAIMER}
      </p>

      <Field
        label="Seller display name / username"
        value={form.seller_display_name}
        onChange={(v) => setForm((f) => ({ ...f, seller_display_name: v }))}
        placeholder="e.g. GreenGhost23 — not a legal name"
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="form-label">Platform used</label>
          <select
            value={form.platform}
            onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
            className="form-input mt-2"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Meetup type</label>
          <select
            value={form.meetup_type}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                meetup_type: e.target.value as MeetupType,
              }))
            }
            className="form-input mt-2"
          >
            {MEETUP_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="form-label">City</label>
          <select
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            className="form-input mt-2"
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <Field
          label="General area (optional)"
          value={form.area}
          onChange={(v) => setForm((f) => ({ ...f, area: v }))}
          placeholder="e.g. East side — no street address"
        />
      </div>

      <section>
        <label className="form-label">Warning flags</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {MEETUP_ISSUE_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition",
                form.issue_tags.includes(tag)
                  ? "border-purple-500/40 bg-purple-500/15 text-purple-300"
                  : "border-[var(--border-soft)] text-[var(--text-muted)] hover:border-[var(--border-soft)]"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      <div>
        <label className="form-label">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          rows={4}
          placeholder="Describe your user-submitted experience. No phone numbers, addresses, or threats."
          className="form-input mt-2 resize-none"
          required
        />
      </div>

      <div>
        <label className="form-label">Screenshot (optional, blur faces)</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="mt-2 block w-full text-sm text-[var(--text-muted)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--bg-elevated)] file:px-3 file:py-2 file:text-sm file:text-[var(--text-main)]"
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              image_file: e.target.files?.[0] ?? null,
            }))
          }
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <motion.button
        type="submit"
        disabled={submitting}
        whileTap={{ scale: 0.98 }}
        className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(168,85,247,0.25)] disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit safety warning"}
      </motion.button>

      <Disclaimer />
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="form-input mt-2"
      />
    </div>
  );
}
