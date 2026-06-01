"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";
import { Award, Flame, Target, TrendingUp } from "lucide-react";
import { useAuth } from "@/components/BoofAuthProvider";
import { useCurrentUserProfile } from "@/hooks/useHomeData";
import {
  analystCardHeading,
  profileFromBoofUser,
  REPORTER_TIERS,
} from "@/lib/reporter-tiers";
import type { UserProfile } from "@/lib/types";

export function AnalystCard() {
  const { isAuthenticated, loading: authLoading, profile: authProfile } =
    useAuth();
  const analystProfile = useCurrentUserProfile();

  if (!isAuthenticated) {
    return <AnalystCardGuest />;
  }

  if (authLoading || analystProfile === undefined) {
    return <AnalystCardSkeleton />;
  }

  const profile =
    analystProfile ?? (authProfile ? profileFromBoofUser(authProfile) : null);

  if (!profile) {
    return <AnalystCardSkeleton />;
  }

  return <AnalystCardLoaded profile={profile} />;
}

function AnalystCardGuest() {
  return (
    <section aria-label="Analyst ranks">
      <header className="mb-4">
        <p className="font-heading text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-500">
          Analyst ranks
        </p>
        <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">
          Your analyst card
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Sign in to track accuracy, streaks, badges, and your rank.
        </p>
      </header>

      <div className="glass-card border-emerald-500/15 p-5">
        <ReporterTierList />
        <div className="mt-5 border-t border-zinc-800/60 pt-5">
          <SignInButton mode="modal">
            <button type="button" className="btn-primary w-full px-5 py-2.5 text-sm sm:w-auto">
              Sign in to unlock your card
            </button>
          </SignInButton>
        </div>
      </div>
    </section>
  );
}

function AnalystCardSkeleton() {
  return (
    <section aria-label="Analyst profile" aria-busy="true">
      <div className="mb-4 h-4 w-24 animate-pulse rounded bg-zinc-800" />
      <div className="glass-card h-48 animate-pulse border-zinc-800/80 bg-zinc-900/40" />
    </section>
  );
}

function AnalystCardLoaded({ profile }: { profile: UserProfile }) {
  const initials = (profile.display_name ?? "You")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section aria-label="Analyst profile">
      <header className="mb-4">
        <p className="font-heading text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-500">
          Analyst card
        </p>
        <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">
          {analystCardHeading(profile.role_title)}
        </h2>
      </header>

      <div className="glass-card relative overflow-hidden border-emerald-500/20 p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 font-heading text-lg font-bold text-emerald-300 sm:h-16 sm:w-16 sm:text-xl">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">
                {profile.role_title}
              </p>
              <h3 className="truncate font-heading text-lg font-bold text-white sm:text-xl">
                {profile.display_name ?? "Community member"}
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Level {profile.level} · {profile.report_count} reports ·{" "}
                {profile.points.toLocaleString()} pts
              </p>
            </div>
            <UserButton
              appearance={{
                elements: { avatarBox: "h-10 w-10 shrink-0" },
              }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <StatPill
              icon={Target}
              label="Accuracy"
              value={
                profile.accuracy_score != null
                  ? `${profile.accuracy_score}%`
                  : "—"
              }
            />
            <StatPill
              icon={Flame}
              label="Streak"
              value={`${profile.streak_count}d`}
            />
            <StatPill
              icon={TrendingUp}
              label="Points"
              value={profile.points.toLocaleString()}
            />
          </div>
        </div>

        {profile.badges.length > 0 && (
          <div className="relative mt-5 flex flex-wrap gap-2">
            {profile.badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-300"
              >
                <Award className="h-3 w-3" />
                {badge}
              </span>
            ))}
          </div>
        )}

        <details className="relative mt-5 border-t border-zinc-800/60 pt-4">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-400">
            Rank ladder
          </summary>
          <div className="mt-3">
            <ReporterTierList currentTitle={profile.role_title} />
          </div>
        </details>
      </div>
    </section>
  );
}

function ReporterTierList({ currentTitle }: { currentTitle?: string }) {
  return (
    <ol className="space-y-2">
      {REPORTER_TIERS.map((tier) => {
        const active = tier.title === currentTitle;
        return (
          <li
            key={tier.title}
            className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm ${
              active
                ? "border-emerald-500/40 bg-emerald-500/10 text-white"
                : "border-zinc-800/80 bg-zinc-900/40 text-zinc-400"
            }`}
          >
            <span className={active ? "font-semibold text-emerald-300" : ""}>
              {tier.title}
            </span>
            <span className="text-right text-[11px] text-zinc-500">{tier.unlock}</span>
          </li>
        );
      })}
    </ol>
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
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-2 py-2 text-center sm:px-3">
      <Icon className="mx-auto h-3.5 w-3.5 text-emerald-500" />
      <p className="mt-1 font-heading text-sm font-bold text-white">{value}</p>
      <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600">
        {label}
      </p>
    </div>
  );
}
