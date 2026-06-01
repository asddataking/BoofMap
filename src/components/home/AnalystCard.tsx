"use client";

import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { Award, Flame, Target, TrendingUp } from "lucide-react";
import { useAuth } from "@/components/BoofAuthProvider";
import { useCurrentUserProfile } from "@/hooks/useHomeData";
import { getSeedUserProfile } from "@/lib/home/seed";

export function AnalystCard() {
  const { isAuthenticated } = useAuth();
  const profile = useCurrentUserProfile();
  const display = profile ?? getSeedUserProfile();

  return (
    <section aria-label="Analyst profile">
      <div className="mb-5">
        <p className="font-heading text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-500">
          Your Card
        </p>
        <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
          Smoke GM Dashboard
        </h2>
      </div>

      <div className="glass-card relative overflow-hidden border-emerald-500/20 p-6">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 font-heading text-xl font-bold text-emerald-300">
              {(display.display_name ?? "GM")
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <p className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">
                {display.role_title}
              </p>
              <h3 className="font-heading text-xl font-bold text-white">
                {isAuthenticated
                  ? (display.display_name ?? "Community member")
                  : "Smoke GM"}
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                {isAuthenticated
                  ? `Level ${display.level} · ${display.report_count} reports · ${display.points} pts`
                  : "Sign in to track your analyst stats"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <StatPill
              icon={Target}
              label="Accuracy"
              value={
                display.accuracy_score != null
                  ? `${display.accuracy_score}%`
                  : "—"
              }
            />
            <StatPill
              icon={Flame}
              label="Streak"
              value={`${display.streak_count}d`}
            />
            <StatPill
              icon={TrendingUp}
              label="Points"
              value={display.points.toLocaleString()}
            />
          </div>
        </div>

        <div className="relative mt-5 flex flex-wrap gap-2">
          {display.badges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-300"
            >
              <Award className="h-3 w-3" />
              {badge}
            </span>
          ))}
        </div>

        {!isAuthenticated && (
          <div className="relative mt-5 flex flex-wrap gap-3 border-t border-zinc-800/60 pt-5">
            <SignInButton mode="modal">
              <button type="button" className="btn-primary px-5 py-2.5 text-sm">
                Sign in to unlock your card
              </button>
            </SignInButton>
            <Link href="/profile" className="btn-secondary px-5 py-2.5 text-sm">
              View profile
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-3 py-2 text-center">
      <Icon className="mx-auto h-3.5 w-3.5 text-emerald-500" />
      <p className="mt-1 font-heading text-sm font-bold text-white">{value}</p>
      <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600">
        {label}
      </p>
    </div>
  );
}
