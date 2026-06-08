"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { Building2, Lock, User, Users } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/components/BoofAuthProvider";
import { isConvexConfigured } from "@/lib/convex/config";
import type { ProfileRole } from "@/lib/intelligence/types";
import { cn } from "@/lib/utils";

const ROLE_META: Record<
  ProfileRole,
  { label: string; icon: typeof User; applyHref: string; applyLabel: string }
> = {
  customer: {
    label: "Customer",
    icon: User,
    applyHref: "/report",
    applyLabel: "Submit detections",
  },
  budtender: {
    label: "Budtender",
    icon: Users,
    applyHref: "/insiders",
    applyLabel: "Apply to Boof Detection",
  },
  brand: {
    label: "Brand",
    icon: Building2,
    applyHref: "/brands/partner",
    applyLabel: "Apply for partnership",
  },
};

export function ProfileRoleSwitcher({
  activeRole,
  onRoleChange,
}: {
  activeRole: ProfileRole;
  onRoleChange?: (role: ProfileRole) => void;
}) {
  const { isAuthenticated } = useAuth();
  const context = useQuery(
    api.profiles.getRoleContext,
    isConvexConfigured() && isAuthenticated ? {} : "skip"
  );
  const setView = useMutation(api.profiles.setActiveViewRole);

  if (!isAuthenticated) return null;

  const available = new Set<ProfileRole>(
    (context?.available_roles as ProfileRole[] | undefined) ?? ["customer"]
  );
  const roles: ProfileRole[] = ["customer", "budtender", "brand"];

  async function select(role: ProfileRole) {
    if (!available.has(role)) return;
    if (isConvexConfigured()) {
      await setView({ role });
    }
    onRoleChange?.(role);
  }

  return (
    <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-1.5">
      <p className="px-3 pb-2 pt-1 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
        Profile view
      </p>
      <div className="grid grid-cols-3 gap-1">
        {roles.map((role) => {
          const meta = ROLE_META[role];
          const Icon = meta.icon;
          const unlocked = available.has(role);
          const selected = activeRole === role;

          return (
            <button
              key={role}
              type="button"
              disabled={!unlocked}
              onClick={() => select(role)}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-lg px-2 py-3 text-center transition",
                selected
                  ? "bg-[#39FF88]/12 text-[#39FF88] ring-1 ring-[#39FF88]/40"
                  : unlocked
                    ? "text-[var(--text-muted)] hover:bg-[var(--bg-panel)] hover:text-[var(--text-main)]"
                    : "cursor-not-allowed text-[var(--text-muted)]/40"
              )}
            >
              {!unlocked && (
                <Lock className="absolute right-1.5 top-1.5 h-3 w-3 opacity-50" />
              )}
              <Icon className="h-4 w-4" />
              <span className="font-display text-[10px] font-bold uppercase tracking-wide sm:text-xs">
                {meta.label}
              </span>
            </button>
          );
        })}
      </div>

      {!available.has("budtender") && (
        <p className="mt-2 px-3 text-[11px] text-[var(--text-muted)]">
          Budtender view locked.{" "}
          <Link href="/insiders" className="text-[#39FF88] hover:underline">
            Apply to Boof Detection
          </Link>
        </p>
      )}
      {!available.has("brand") && (
        <p className="mt-1 px-3 text-[11px] text-[var(--text-muted)]">
          Brand view locked.{" "}
          <Link href="/brands/partner" className="text-[#39FF88] hover:underline">
            Claim your brand
          </Link>
        </p>
      )}
    </div>
  );
}

export function useProfileRoleContext() {
  const { isAuthenticated } = useAuth();
  return useQuery(
    api.profiles.getRoleContext,
    isConvexConfigured() && isAuthenticated ? {} : "skip"
  );
}
