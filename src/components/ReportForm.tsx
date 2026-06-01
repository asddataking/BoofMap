"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BOOF_QUICK_FLAGS,
  ISSUE_TAGS,
  PRODUCT_TYPES,
  CITIES,
} from "@/lib/constants";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { ProductType, ReportFormData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuth } from "./BoofAuthProvider";
import { SignInPrompt } from "./SignInPrompt";
import { useReportImageUpload } from "@/lib/storage/r2-upload";

const initial: ReportFormData = {
  product_type: "flower",
  brand_name: "",
  dispensary_name: "",
  city: "Detroit",
  strain_name: "",
  price_paid: "",
  package_date: "",
  issue_tags: [],
  boof_score: 3,
  notes: "",
};

export function ReportForm({
  onSuccess,
  useQuickFlags = false,
}: {
  onSuccess?: () => void;
  useQuickFlags?: boolean;
} = {}) {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const createReport = useMutation(api.reports.create);
  const uploadImage = useReportImageUpload();
  const [form, setForm] = useState<ReportFormData>(initial);
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

  const toggleQuickFlag = (issueTag: string) => toggleTag(issueTag);

  const isQuickFlagActive = (issueTag: string) =>
    form.issue_tags.includes(issueTag);

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
          (await uploadImage(form.image_file, "reports")) ?? undefined;
      }

      const result = await createReport({
        productType: form.product_type,
        brandName: form.brand_name,
        dispensaryName: form.dispensary_name,
        city: form.city,
        strainName: form.strain_name,
        pricePaid: form.price_paid ? parseFloat(form.price_paid) : undefined,
        packageDate: form.package_date || undefined,
        issueTags: form.issue_tags,
        boofScore: form.boof_score,
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
        router.push("/reports");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500">Loading…</p>
    );
  }

  if (!isAuthenticated) {
    return <SignInPrompt message="Sign in to report boof, fire, or taxed product." />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section>
        <label className="form-label">Product type</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRODUCT_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setForm((f) => ({ ...f, product_type: value as ProductType }))
              }
              className={cn(
                "rounded-xl border px-3 py-2 text-sm transition",
                form.product_type === value
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                  : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Brand / grower"
          value={form.brand_name}
          onChange={(v) => setForm((f) => ({ ...f, brand_name: v }))}
          required
        />
        <Field
          label="Dispensary name"
          value={form.dispensary_name}
          onChange={(v) => setForm((f) => ({ ...f, dispensary_name: v }))}
          required
        />
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
          label="Strain / product name"
          value={form.strain_name}
          onChange={(v) => setForm((f) => ({ ...f, strain_name: v }))}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Price paid ($)"
          type="number"
          value={form.price_paid}
          onChange={(v) => setForm((f) => ({ ...f, price_paid: v }))}
        />
        <Field
          label="Package date"
          type="date"
          value={form.package_date}
          onChange={(v) => setForm((f) => ({ ...f, package_date: v }))}
        />
      </div>

      <section>
        <label className="form-label">
          {useQuickFlags ? "Quick boof flags" : "Reported issues (community tags)"}
        </label>
        {useQuickFlags ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {BOOF_QUICK_FLAGS.map(({ label, issueTag }) => (
              <button
                key={label}
                type="button"
                onClick={() => toggleQuickFlag(issueTag)}
                className={cn(
                  "rounded-full border px-3 py-2 text-xs font-medium transition",
                  isQuickFlagActive(issueTag)
                    ? "border-red-500/40 bg-red-500/15 text-red-300"
                    : "border-zinc-800 text-zinc-500 hover:border-zinc-700"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {ISSUE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition",
                  form.issue_tags.includes(tag)
                    ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                    : "border-zinc-800 text-zinc-500 hover:border-zinc-700"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
        {useQuickFlags && (
          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-400">
              More issue tags
            </summary>
            <div className="mt-2 flex flex-wrap gap-2">
              {ISSUE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition",
                    form.issue_tags.includes(tag)
                      ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                      : "border-zinc-800 text-zinc-500 hover:border-zinc-700"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </details>
        )}
      </section>

      <section>
        <label className="form-label">
          Boof Score: {form.boof_score.toFixed(1)} (1 = boof, 5 = fire)
        </label>
        <input
          type="range"
          min={1}
          max={5}
          step={0.5}
          value={form.boof_score}
          onChange={(e) =>
            setForm((f) => ({ ...f, boof_score: parseFloat(e.target.value) }))
          }
          className="mt-3 w-full accent-emerald-500"
        />
        <div className="mt-1 flex justify-between text-[10px] text-zinc-600">
          <span>Boof</span>
          <span>Fire</span>
        </div>
      </section>

      <div>
        <label className="form-label">Photo (optional)</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="mt-2 block w-full text-sm text-zinc-500 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-sm file:text-zinc-300"
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              image_file: e.target.files?.[0] ?? null,
            }))
          }
        />
        <p className="mt-1 text-[10px] text-zinc-600">
          Uploaded to Cloudflare R2 when configured.
        </p>
      </div>

      <div>
        <label className="form-label">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          rows={3}
          placeholder="Share your community report — keep it factual and respectful."
          className="form-input mt-2 resize-none"
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
        className="btn-primary w-full disabled:opacity-50"
      >
        {submitting
          ? "Submitting…"
          : useQuickFlags
            ? "Submit boof report"
            : "Submit community report"}
      </motion.button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="form-input mt-2"
      />
    </div>
  );
}
