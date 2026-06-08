"use client";

import Link from "next/link";
import { Building2, MapPin, Shield, Target, User, Users } from "lucide-react";
import {
  ProfileRoleSwitcher,
  useProfileRoleContext,
} from "./ProfileRoleSwitcher";
import type { ProfileRole } from "@/lib/intelligence/types";
import { useAuth } from "@/components/BoofAuthProvider";

function CustomerProfileCard({
  displayName,
}: {
  displayName?: string | null;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--bg-panel)] text-2xl">
          <User className="h-7 w-7 text-[var(--text-muted)]" />
        </div>
        <div>
          <p className="section-kicker !mb-1">Customer</p>
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-[var(--text-main)]">
            {displayName ?? "Community Member"}
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Reddit-style reputation profile. Submit reports, save products,
            and build trust through community intelligence.
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/report" className="btn-primary !px-5 !py-2.5 text-sm">
          Report Boof
        </Link>
        <Link href="/reports" className="btn-secondary !px-5 !py-2.5 text-sm">
          Intel map
        </Link>
      </div>
    </div>
  );
}

function BudtenderProfileCard({
  displayName,
  dispensary,
}: {
  displayName?: string | null;
  dispensary?: string | null;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#39FF88]/35 bg-gradient-to-br from-[#39FF88]/10 via-[var(--bg-card)] to-[var(--bg-card)] p-6">
      <div className="absolute right-4 top-4 rounded-md bg-[#39FF88]/15 px-2 py-1 font-display text-[9px] font-bold uppercase tracking-wider text-[#39FF88]">
        Verified Insider
      </div>
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#39FF88]/15 text-3xl">
          <Users className="h-8 w-8 text-[#39FF88]" />
        </div>
        <div>
          <p className="section-kicker !mb-1">Boof Insiders</p>
          <h2 className="font-display text-2xl font-black uppercase tracking-tight text-[var(--text-main)]">
            {displayName ?? "Insider"}
          </h2>
          {dispensary && (
            <p className="mt-1 flex items-center gap-1 text-sm text-[var(--text-muted)]">
              <MapPin className="h-3.5 w-3.5" />
              {dispensary}
            </p>
          )}
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            ESPN-style insider card. Field intelligence from the counter —
            verify signals, confirm alerts, contribute shelf truth.
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-2 sm:grid-cols-3">
        {[
          { icon: Target, label: "Submit reports" },
          { icon: Shield, label: "Verify alerts" },
          { icon: Users, label: "Insider network" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-lg border border-[#39FF88]/20 bg-[#39FF88]/5 px-3 py-2"
          >
            <Icon className="h-4 w-4 text-[#39FF88]" />
            <span className="text-[11px] font-semibold text-[var(--text-main)]">
              {label}
            </span>
          </div>
        ))}
      </div>
      <Link
        href="/insiders"
        className="mt-4 inline-flex text-sm font-semibold text-[#39FF88] hover:underline"
      >
        Insiders program →
      </Link>
    </div>
  );
}

function BrandProfileCard({
  brandName,
}: {
  brandName?: string | null;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--bg-panel)]">
          <Building2 className="h-7 w-7 text-[#39FF88]" />
        </div>
        <div>
          <p className="section-kicker !mb-1">Brand Partner</p>
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-[var(--text-main)]">
            {brandName ?? "Your Brand"}
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Bloomberg-style company profile. Batch transparency, market
            analytics, and official responses — accountability, not ads.
          </p>
        </div>
      </div>
      <ul className="mt-5 space-y-2 text-sm text-[var(--text-muted)]">
        <li className="flex gap-2">
          <span className="text-[#39FF88]">✓</span> Claim & manage brand page
        </li>
        <li className="flex gap-2">
          <span className="text-[#39FF88]">✓</span> Submit batch & COA data
        </li>
        <li className="flex gap-2">
          <span className="text-[#39FF88]">✓</span> Respond to community reports
        </li>
      </ul>
      <Link
        href="/brands/partner"
        className="btn-secondary mt-5 inline-flex px-6 py-3"
      >
        Brand partner hub
      </Link>
    </div>
  );
}

export function ProfileIntelligencePanel() {
  const { isAuthenticated } = useAuth();
  const context = useProfileRoleContext();

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-6 text-center">
        <p className="text-sm text-[var(--text-muted)]">
          Sign in to access role-based profile views.
        </p>
      </div>
    );
  }

  const activeRole = (context?.active_view_role ?? "customer") as ProfileRole;
  const displayName = context?.display_name;

  return (
    <div className="space-y-4">
      <ProfileRoleSwitcher activeRole={activeRole} />

      {activeRole === "customer" && (
        <CustomerProfileCard displayName={displayName} />
      )}
      {activeRole === "budtender" && (
        <BudtenderProfileCard
          displayName={
            context?.budtender_application?.display_name ?? displayName
          }
          dispensary={context?.budtender_application?.dispensary_name}
        />
      )}
      {activeRole === "brand" && (
        <BrandProfileCard
          brandName={context?.brand_application?.brand_name}
        />
      )}
    </div>
  );
}
