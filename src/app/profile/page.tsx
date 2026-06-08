"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { InstallPrompt } from "@/components/InstallPrompt";
import { PageTransition } from "@/components/PageTransition";
import { AnalystCard } from "@/components/profile/AnalystCard";
import { ForecastAnalystCard } from "@/components/forecast/ForecastAnalystCard";
import { ProfileIntelligencePanel } from "@/components/profile/ProfileIntelligencePanel";
import { GAMIFICATION_ENABLED } from "@/lib/intelligence/featureFlags";
import { useAuth } from "@/components/BoofAuthProvider";
import { NotificationSettings } from "@/components/NotificationSettings";
import { ProfileMyReports } from "@/components/ProfileMyReports";
import { isConvexConfigured } from "@/lib/convex/config";

export default function ProfilePage() {
  const { isAdmin, isAuthenticated } = useAuth();

  return (
    <AppShell>
      <PageTransition>
        <div className="space-y-6 py-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">
              Profile
            </h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Your intelligence profile, reports, alerts, and reputation.
            </p>
          </div>

          {isAdmin && (
            <Link
              href="/admin"
              className="glass-card flex items-center justify-between gap-3 border-amber-500/30 bg-amber-500/10 p-4 text-amber-200 transition hover:border-amber-500/50"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-amber-400" />
                <div>
                  <span className="text-sm font-semibold">Admin panel</span>
                  <p className="text-xs text-amber-200/70">
                    Manage reports, users, and moderation
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-amber-400">Open →</span>
            </Link>
          )}

          <ProfileIntelligencePanel />

          {isAuthenticated && <ForecastAnalystCard />}

          {GAMIFICATION_ENABLED && <AnalystCard />}

          <InstallPrompt />

          {isAuthenticated && <ProfileMyReports />}

          <section>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Boof Alerts
            </h2>
            <NotificationSettings compact />
          </section>

          <div className="space-y-2">
            <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Quick actions
            </h2>
            <div className="grid gap-2">
              <Link href="/reports" className="btn-primary text-center">
                Open intel map
              </Link>
              <Link
                href="/report"
                className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] px-6 py-3.5 text-center text-sm font-semibold text-white hover:border-[var(--border-soft)]"
              >
                Report Boof
              </Link>
            </div>
          </div>

          {isAdmin && (
            <Link
              href="/admin"
              className="glass-card flex items-center gap-3 p-4 text-amber-400/90 transition hover:border-amber-500/30"
            >
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Admin dashboard</span>
            </Link>
          )}

          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] p-4 text-xs leading-relaxed text-[var(--text-muted)]">
            <p className="font-medium text-[var(--text-muted)]">Mobile tips</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Allow location for &quot;Near Me&quot; filters</li>
              <li>Use your camera roll when reporting with photos</li>
              <li>Share reports from Safari or Chrome like any webpage</li>
              <li>Add to Home Screen for full-screen map access</li>
            </ul>
            {!isConvexConfigured() && (
              <p className="mt-3 text-amber-400/80">
                Convex is not connected — reports use local seed data only.
              </p>
            )}
          </div>
        </div>
      </PageTransition>
    </AppShell>
  );
}
