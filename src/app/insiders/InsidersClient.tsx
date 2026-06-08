"use client";

import Link from "next/link";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Eye,
  MapPin,
  Radar,
  Shield,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageTransition } from "@/components/PageTransition";
import { BudtenderApplicationForm } from "@/components/intelligence/BudtenderApplicationForm";
import { IntelLandingHero } from "@/components/intelligence/landing/IntelLandingHero";
import { IntelGridOverlay } from "@/components/intelligence/IntelGridOverlay";
import { useAuth } from "@/components/BoofAuthProvider";

const RESPONSIBILITIES = [
  {
    icon: Target,
    title: "Submit reports",
    body: "Flag fire, boof, value, and batch warnings from the counter.",
  },
  {
    icon: BadgeCheck,
    title: "Verify signals",
    body: "Confirm community intel you've seen on shelves.",
  },
  {
    icon: Zap,
    title: "Confirm alerts",
    body: "Validate warnings before they spread across the network.",
  },
  {
    icon: Users,
    title: "Refer insiders",
    body: "Bring trusted budtenders into the insider network.",
  },
  {
    icon: Radar,
    title: "Product intelligence",
    body: "Share batch context, COA notes, and real shelf performance.",
  },
];

const BENEFITS = [
  { icon: Shield, label: "Verified insider badge" },
  { icon: Eye, label: "Early market signals" },
  { icon: MapPin, label: "Local intel visibility" },
  { icon: BadgeCheck, label: "Industry recognition" },
];

const STEPS = [
  { step: "01", title: "Apply", body: "Tell us where you work and what you see on shelves." },
  { step: "02", title: "Verify", body: "We review applications from active budtenders." },
  { step: "03", title: "Report", body: "Submit and verify product intelligence for your market." },
];

export function InsidersClient() {
  const { isAuthenticated } = useAuth();

  return (
    <AppShell variant="landing">
      <PageTransition>
        <div className="space-y-20 pb-16 pt-4">
          <IntelLandingHero
            kicker="Boof Insiders"
            title="Become a Cannabis"
            titleAccent="Intelligence Insider"
            subtitle="Help identify fire. Expose boof. Contribute real product intelligence the community can trust — not pay-to-play listings."
            tagline="Budtenders see the market first."
          >
            {isAuthenticated ? (
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="#apply"
                  className="btn-primary inline-flex items-center gap-2 px-10 py-4"
                >
                  <Target className="h-4 w-4" />
                  Apply Now
                </Link>
                <Link
                  href="/report"
                  className="btn-secondary inline-flex items-center gap-2 px-8 py-4"
                >
                  Report Boof
                </Link>
              </div>
            ) : (
              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="btn-primary inline-flex items-center gap-2 px-10 py-4"
                >
                  <Target className="h-4 w-4" />
                  Become an Insider
                </button>
              </SignUpButton>
            )}
          </IntelLandingHero>

          <section aria-label="What insiders do">
            <div className="mb-8 text-center lg:text-left">
              <p className="section-kicker">Responsibilities</p>
              <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-[var(--text-main)]">
                What Insiders Do
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
                You&apos;re not writing reviews. You&apos;re submitting field
                intelligence — the same signals that power BoofMap&apos;s live
                market terminal.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {RESPONSIBILITIES.map((item, i) => (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="relative overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-5"
                >
                  <item.icon className="h-5 w-5 text-[#39FF88]" />
                  <h3 className="mt-3 font-display text-sm font-extrabold uppercase tracking-tight text-[var(--text-main)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">
                    {item.body}
                  </p>
                </motion.article>
              ))}
            </div>
          </section>

          <section
            aria-label="How it works"
            className="relative overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-panel)] p-8 lg:p-10"
          >
            <IntelGridOverlay />
            <div className="relative">
              <p className="section-kicker">Process</p>
              <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-[var(--text-main)]">
                How Insiders Work
              </h2>
              <div className="mt-8 grid gap-6 lg:grid-cols-3">
                {STEPS.map((s, i) => (
                  <div key={s.step} className="relative">
                    {i < STEPS.length - 1 && (
                      <div className="absolute left-[calc(50%+2rem)] top-6 hidden h-px w-[calc(100%-4rem)] bg-[#39FF88]/20 lg:block" />
                    )}
                    <span className="font-display text-4xl font-black text-[#39FF88]/30">
                      {s.step}
                    </span>
                    <h3 className="mt-2 font-display text-lg font-extrabold uppercase text-[var(--text-main)]">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">
                      {s.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section aria-label="Insider benefits">
            <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-[var(--text-main)]">
              Insider Benefits
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {BENEFITS.map((b, i) => (
                <motion.div
                  key={b.label}
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 rounded-xl border border-[#39FF88]/20 bg-[#39FF88]/5 px-4 py-4"
                >
                  <b.icon className="h-5 w-5 shrink-0 text-[#39FF88]" />
                  <span className="font-display text-xs font-bold uppercase tracking-wide text-[var(--text-main)]">
                    {b.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </section>

          <section id="apply" aria-label="Budtender application" className="scroll-mt-24">
            <div className="mb-6">
              <p className="section-kicker">Join the network</p>
              <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-[var(--text-main)]">
                Apply to Insiders
              </h2>
              <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)]">
                Verified budtenders unlock the insider profile view, reporting
                tools, and network visibility. Applications reviewed manually.
              </p>
            </div>
            <BudtenderApplicationForm />
          </section>

          <section className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-8 text-center">
            <p className="font-display text-lg font-bold uppercase tracking-tight text-[var(--text-main)]">
              Already approved?
            </p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Switch to your Budtender profile view on your account page.
            </p>
            <Link href="/profile" className="btn-secondary mt-4 inline-flex px-8 py-3">
              Go to profile
            </Link>
          </section>
        </div>
      </PageTransition>
    </AppShell>
  );
}
