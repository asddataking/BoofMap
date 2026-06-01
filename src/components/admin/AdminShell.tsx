"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  LayoutDashboard,
  Newspaper,
  Shield,
  Users,
  UserCheck,
} from "lucide-react";
import { BoofLogo } from "@/components/BoofLogo";
import { cn } from "@/lib/utils";

export type AdminSection =
  | "overview"
  | "users"
  | "reports"
  | "meetups"
  | "moderation";

const nav: { id: AdminSection; label: string; icon: typeof LayoutDashboard }[] =
  [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "reports", label: "Product Reports", icon: Newspaper },
    { id: "meetups", label: "Meetup Reports", icon: UserCheck },
    { id: "moderation", label: "Moderation", icon: Shield },
  ];

export function AdminShell({
  section,
  onSectionChange,
  pendingCount,
  children,
}: {
  section: AdminSection;
  onSectionChange: (s: AdminSection) => void;
  pendingCount: number;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-900 bg-zinc-950/50 lg:flex">
          <div className="border-b border-zinc-900 p-5">
            <BoofLogo size="sm" showBeta={false} className="mb-4" />
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-1.5 text-xs text-zinc-500 transition hover:text-zinc-300"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Back to home
            </Link>
            <h1 className="font-heading text-lg font-bold text-white">
              Admin<span className="text-emerald-400">Panel</span>
            </h1>
            <p className="mt-0.5 text-xs text-zinc-500">Manage BoofMap</p>
          </div>

          <nav className="flex-1 space-y-1 p-3">
            {nav.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => onSectionChange(id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  section === id
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
                {id === "moderation" && pendingCount > 0 && (
                  <span className="ml-auto rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-300">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="border-t border-zinc-900 p-4">
            <div className="flex items-center gap-2 rounded-xl bg-zinc-900/60 px-3 py-2.5">
              <Bot className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-zinc-400">AI assistant available</span>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-zinc-900 bg-[#050505]/90 backdrop-blur-xl lg:hidden">
            <div className="flex items-center gap-2 overflow-x-auto px-4 py-3 scrollbar-thin">
              <Link href="/" className="shrink-0 text-zinc-500">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              {nav.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSectionChange(id)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
                    section === id
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-zinc-900 text-zinc-400"
                  )}
                >
                  {label}
                  {id === "moderation" && pendingCount > 0 && ` (${pendingCount})`}
                </button>
              ))}
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="font-heading text-2xl font-bold tracking-tight text-white">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    pending: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    flagged: "bg-orange-500/15 text-orange-300 border-orange-500/25",
    rejected: "bg-red-500/15 text-red-300 border-red-500/25",
    admin: "bg-purple-500/15 text-purple-300 border-purple-500/25",
    user: "bg-zinc-800 text-zinc-400 border-zinc-700",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        styles[status] ?? styles.user
      )}
    >
      {status}
    </span>
  );
}
