"use client";

import { useQuery } from "convex/react";
import {
  AlertTriangle,
  Clock,
  Newspaper,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { AdminPageHeader, StatusBadge } from "./AdminShell";
import { formatTimeAgo } from "@/lib/utils";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: typeof Users;
  accent: "emerald" | "amber" | "red" | "purple";
}) {
  const colors = {
    emerald: "text-emerald-400 bg-emerald-500/10",
    amber: "text-amber-400 bg-amber-500/10",
    red: "text-red-400 bg-red-500/10",
    purple: "text-purple-400 bg-purple-500/10",
  };

  return (
    <div className="glass-card p-5">
      <div className={`mb-3 inline-flex rounded-lg p-2 ${colors[accent]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="font-heading text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-sm font-medium text-zinc-400">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-zinc-600">{sub}</p>}
    </div>
  );
}

export function AdminOverview() {
  const stats = useQuery(api.admin.getDashboardStats);

  if (!stats) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-zinc-500">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Overview"
        description="Real-time snapshot of BoofMap activity."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total users"
          value={stats.total_users}
          sub={`+${stats.new_users_this_week} this week`}
          icon={Users}
          accent="emerald"
        />
        <StatCard
          label="Product reports"
          value={stats.total_reports}
          sub={`${stats.approved_reports} approved`}
          icon={Newspaper}
          accent="amber"
        />
        <StatCard
          label="Pending review"
          value={stats.pending_reports + stats.pending_meetups}
          sub={`${stats.pending_queue} in queue`}
          icon={Clock}
          accent="red"
        />
        <StatCard
          label="Meetup reports"
          value={stats.total_meetups}
          icon={UserCheck}
          accent="purple"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h3 className="font-heading font-semibold text-white">
              Recent signups
            </h3>
          </div>
          {stats.recent_signups.length === 0 ? (
            <p className="text-sm text-zinc-500">No users yet.</p>
          ) : (
            <ul className="space-y-3">
              {stats.recent_signups.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-zinc-900/40 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-200">
                      {user.display_name ?? "Anonymous"}
                    </p>
                    <p className="truncate text-xs text-zinc-600">
                      {user.clerk_id}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <StatusBadge status={user.role} />
                    <p className="mt-1 text-[10px] text-zinc-600">
                      {formatTimeAgo(user.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h3 className="font-heading font-semibold text-white">
              Moderation summary
            </h3>
          </div>
          <dl className="space-y-3">
            {[
              ["Queue items", stats.pending_queue],
              ["Pending product reports", stats.pending_reports],
              ["Pending meetup reports", stats.pending_meetups],
              ["Rejected reports", stats.rejected_reports],
            ].map(([label, value]) => (
              <div
                key={label as string}
                className="flex items-center justify-between rounded-xl bg-zinc-900/40 px-3 py-2.5"
              >
                <dt className="text-sm text-zinc-400">{label}</dt>
                <dd className="font-heading text-lg font-semibold text-white">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
