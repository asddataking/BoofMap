"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { Shield } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/components/BoofAuthProvider";
import { SignInPrompt } from "@/components/SignInPrompt";
import { isConvexConfigured } from "@/lib/convex/config";
import { AdminShell, type AdminSection } from "./AdminShell";
import { AdminOverview } from "./AdminOverview";
import { AdminUsers } from "./AdminUsers";
import { AdminReportsPanel } from "./AdminReportsPanel";
import { AdminMeetupPanel } from "./AdminMeetupPanel";
import { AdminModerationPanel } from "./AdminModerationPanel";
import { AdminAiChat } from "./AdminAiChat";
import { AdminBudtenderPanel } from "./AdminBudtenderPanel";
import { AdminBrandPanel } from "./AdminBrandPanel";

export function AdminDashboard() {
  const { isAdmin, loading, isAuthenticated } = useAuth();
  const [section, setSection] = useState<AdminSection>("overview");

  const stats = useQuery(
    api.admin.getDashboardStats,
    isAdmin && isConvexConfigured() ? {} : "skip"
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-[var(--text-muted)]">
        Loading admin…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4">
        <div className="w-full max-w-md">
          <SignInPrompt message="Sign in with your admin account to continue." />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4">
        <div className="max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
          <Shield className="mx-auto mb-3 h-10 w-10 text-red-400" />
          <h2 className="font-heading text-lg font-bold text-red-200">
            Admin access required
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Your account isn&apos;t in the admin list. Add your Clerk user ID or
            email to <code className="text-[var(--text-muted)]">ADMIN_USER_IDS</code> /{" "}
            <code className="text-[var(--text-muted)]">ADMIN_EMAILS</code> in Convex, then
            sign out and back in.
          </p>
        </div>
      </div>
    );
  }

  if (!isConvexConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-[var(--text-muted)]">
        Connect Convex (NEXT_PUBLIC_CONVEX_URL) to use the admin dashboard.
      </div>
    );
  }

  const pendingCount =
    (stats?.pending_queue ?? 0) +
    (stats?.pending_reports ?? 0) +
    (stats?.pending_meetups ?? 0);

  return (
    <>
      <AdminShell
        section={section}
        onSectionChange={setSection}
        pendingCount={pendingCount}
      >
        {section === "overview" && <AdminOverview />}
        {section === "users" && <AdminUsers />}
        {section === "reports" && <AdminReportsPanel />}
        {section === "meetups" && <AdminMeetupPanel />}
        {section === "moderation" && <AdminModerationPanel />}
        {section === "budtenders" && <AdminBudtenderPanel />}
        {section === "brands" && <AdminBrandPanel />}
      </AdminShell>
      <AdminAiChat />
    </>
  );
}
