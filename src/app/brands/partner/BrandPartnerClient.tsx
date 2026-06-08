"use client";

import { useState } from "react";
import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import {
  BarChart3,
  FileCheck,
  LineChart,
  MessageSquare,
  Package,
  Shield,
  XCircle,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageTransition } from "@/components/PageTransition";
import { IntelLandingHero } from "@/components/intelligence/landing/IntelLandingHero";
import { IntelGridOverlay } from "@/components/intelligence/IntelGridOverlay";
import { useAuth } from "@/components/BoofAuthProvider";
import { api } from "../../../../convex/_generated/api";
import { isConvexConfigured } from "@/lib/convex/config";

const PILLARS = [
  {
    icon: Shield,
    title: "Not Ads. Accountability.",
    body: "BoofMap surfaces what the community detects. Brands cannot pay to be cool. Trust is earned through transparency.",
    accent: "border-[#39FF88]/25",
  },
  {
    icon: Package,
    title: "Claim Brand Page",
    body: "Verify your company, claim your profile, and present accurate product information to the intelligence network.",
    accent: "border-[var(--border-soft)]",
  },
  {
    icon: FileCheck,
    title: "Product Intelligence",
    body: "Submit product details, batch information, and COAs. Community signals validate what you publish.",
    accent: "border-[var(--border-soft)]",
  },
  {
    icon: LineChart,
    title: "Batch Transparency",
    body: "Upload batch-level data so consumers can trace quality across package dates and production runs.",
    accent: "border-[var(--border-soft)]",
  },
  {
    icon: BarChart3,
    title: "Market Analytics",
    body: "Access aggregated community intelligence — trends, detections, and category signals you won't get from ad dashboards.",
    accent: "border-[var(--border-soft)]",
  },
  {
    icon: MessageSquare,
    title: "Official Responses",
    body: "Respond to community detections with accountability. You cannot remove reports or hide alerts.",
    accent: "border-[var(--border-soft)]",
  },
];

const CANNOT_DO = [
  "Buy rankings",
  "Edit community scores",
  "Remove reports",
  "Hide alerts",
  "Influence trust metrics",
];

const COMPARE = [
  { label: "Weedmaps / Leafly", value: "Pay for placement" },
  { label: "BoofMap", value: "Community-detected trust" },
];

function BrandApplicationForm() {
  const { isAuthenticated } = useAuth();
  const existing = useQuery(
    api.profiles.getBrandApplication,
    isConvexConfigured() && isAuthenticated ? {} : "skip"
  );
  const submitApplication = useMutation(api.profiles.submitBrandApplication);
  const [form, setForm] = useState({
    brandName: "",
    companyEmail: "",
    state: "MI",
    website: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-6">
        <p className="text-sm text-[var(--text-muted)]">
          Sign in with your company account to apply.
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
          {existing.brand_name} — we&apos;ll follow up at {existing.company_email}.
        </p>
      </div>
    );
  }

  if (existing?.status === "approved") {
    return (
      <div className="rounded-xl border border-[#39FF88]/30 bg-[#39FF88]/5 p-6">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-[#39FF88]">
          Partnership active
        </p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {existing.brand_name} is on the intelligence network.
        </p>
        <Link href="/profile" className="btn-secondary mt-4 inline-flex px-6 py-3">
          Open brand profile
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isConvexConfigured()) return;
    setStatus("loading");
    try {
      const result = await submitApplication(form);
      if (result && "error" in result) setStatus("error");
      else setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-6 lg:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="form-label" htmlFor="brandName">
            Brand name
          </label>
          <input
            id="brandName"
            className="form-input mt-1"
            value={form.brandName}
            onChange={(e) => setForm({ ...form, brandName: e.target.value })}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="form-label" htmlFor="companyEmail">
            Company email
          </label>
          <input
            id="companyEmail"
            type="email"
            className="form-input mt-1"
            value={form.companyEmail}
            onChange={(e) =>
              setForm({ ...form, companyEmail: e.target.value })
            }
            required
          />
        </div>
        <div>
          <label className="form-label" htmlFor="state">
            State
          </label>
          <input
            id="state"
            className="form-input mt-1"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="form-label" htmlFor="website">
            Website
          </label>
          <input
            id="website"
            className="form-input mt-1"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="https://"
          />
        </div>
      </div>
      <button
        type="submit"
        className="btn-primary mt-6 px-8 py-3"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Submitting…" : "Claim your brand"}
      </button>
      {status === "done" && (
        <p className="mt-3 text-sm text-[#39FF88]">
          Application received. We&apos;ll verify and follow up.
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

export function BrandPartnerClient() {
  return (
    <AppShell variant="landing">
      <PageTransition>
        <div className="space-y-20 pb-16 pt-4">
          <IntelLandingHero
            kicker="Brand Partners"
            title="Claim Your Brand."
            titleAccent="Prove Your Fire."
            subtitle="Join the Cannabis Intelligence Network and build trust through transparency — not advertising."
          >
            <Link href="#apply" className="btn-primary inline-flex px-10 py-4">
              Claim Your Brand
            </Link>
          </IntelLandingHero>

          <section
            aria-label="Positioning"
            className="relative overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-panel)] p-8"
          >
            <IntelGridOverlay />
            <div className="relative grid gap-6 lg:grid-cols-2">
              {COMPARE.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-lg border border-[var(--border-soft)] bg-[var(--bg-card)] px-5 py-4"
                >
                  <span className="text-sm text-[var(--text-muted)]">
                    {row.label}
                  </span>
                  <span
                    className={`font-display text-sm font-bold uppercase ${
                      row.label.includes("BoofMap")
                        ? "text-[#39FF88]"
                        : "text-[#FF3B3B]"
                    }`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section aria-label="Partner capabilities">
            <p className="section-kicker">Capabilities</p>
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-[var(--text-main)]">
              What Brand Partners Get
            </h2>
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {PILLARS.map((s, i) => (
                <motion.article
                  key={s.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className={`rounded-xl border bg-[var(--bg-card)] p-6 ${s.accent}`}
                >
                  <s.icon className="h-6 w-6 text-[#39FF88]" />
                  <h3 className="mt-4 font-display text-lg font-extrabold uppercase tracking-tight text-[var(--text-main)]">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                    {s.body}
                  </p>
                </motion.article>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-[#FF3B3B]/20 bg-[#FF3B3B]/5 p-6 lg:p-8">
            <h2 className="flex items-center gap-2 font-display text-xl font-extrabold uppercase tracking-tight text-[#FF3B3B]">
              <XCircle className="h-5 w-5" />
              What Brands Cannot Do
            </h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {CANNOT_DO.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-[var(--text-muted)]"
                >
                  <span className="text-[#FF3B3B]">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section id="apply" className="scroll-mt-24" aria-label="Brand application">
            <p className="section-kicker">Get started</p>
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-[var(--text-main)]">
              Apply for Partnership
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)]">
              Once approved, switch to your Brand profile view to manage your
              company intelligence dashboard.
            </p>
            <div className="mt-6">
              <BrandApplicationForm />
            </div>
          </section>
        </div>
      </PageTransition>
    </AppShell>
  );
}
