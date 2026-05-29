"use client";

import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Shield, User } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { InstallPrompt } from "@/components/InstallPrompt";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/components/BoofAuthProvider";
import { isConvexConfigured } from "@/lib/convex/config";

export default function ProfilePage() {
  const { user, profile, loading, isAdmin, isAuthenticated } = useAuth();

  return (
    <AppShell>
      <PageTransition>
        <div className="space-y-6 py-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-white">
              Profile
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Your BoofMap account — sign in to report and vote.
            </p>
          </div>

          {isAdmin && (
            <Link
              href="/admin"
              className="glass-card mb-4 flex items-center justify-between gap-3 border-amber-500/30 bg-amber-500/10 p-4 text-amber-200 transition hover:border-amber-500/50"
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

          <div className="glass-card flex items-center gap-4 p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15">
              <User className="h-7 w-7 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              {loading ? (
                <p className="text-sm text-zinc-500">Loading…</p>
              ) : isAuthenticated && user ? (
                <>
                  <p className="truncate text-sm font-medium text-white">
                    {profile?.display_name ?? "Community member"}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-[10px] text-zinc-600">
                    {user.uid}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Reputation: {profile?.reputation ?? 0} · Reports:{" "}
                    {profile?.report_count ?? 0}
                    {isAdmin && (
                      <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-300">
                        Admin
                      </span>
                    )}
                  </p>
                </>
              ) : (
                <p className="text-sm text-zinc-500">
                  Sign in to sync your profile
                </p>
              )}
            </div>
            {isAuthenticated ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-10 w-10",
                  },
                }}
              />
            ) : (
              <SignInButton mode="modal">
                <button type="button" className="btn-primary shrink-0 px-4 py-2 text-sm">
                  Sign in
                </button>
              </SignInButton>
            )}
          </div>

          <InstallPrompt />

          <div className="space-y-2">
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Quick actions
            </h3>
            <div className="grid gap-2">
              <Link href="/" className="btn-primary text-center">
                Open BoofMap
              </Link>
              <Link
                href="/report"
                className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-3.5 text-center text-sm font-semibold text-white hover:border-zinc-700"
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

          <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-4 text-xs leading-relaxed text-zinc-500">
            <p className="font-medium text-zinc-400">Mobile tips</p>
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
