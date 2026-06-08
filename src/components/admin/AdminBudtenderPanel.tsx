"use client";

import { useMutation, useQuery } from "convex/react";
import { Check, X } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { AdminPageHeader } from "./AdminShell";
import { formatTimeAgo } from "@/lib/utils";

export function AdminBudtenderPanel() {
  const applications = useQuery(api.profiles.listPendingBudtenderApplications);
  const review = useMutation(api.profiles.reviewBudtenderApplication);

  return (
    <section>
      <AdminPageHeader
        title="Budtender applications"
        description="Review Boof Insider Network applications"
      />

      {!applications?.length ? (
        <p className="text-sm text-zinc-500">No pending applications.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {applications.map((app) => (
            <li
              key={app.id}
              className="glass-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-white">{app.display_name}</p>
                <p className="text-sm text-zinc-400">
                  {app.dispensary_name
                    ? `${app.dispensary_name} · `
                    : ""}
                  {app.city}, {app.state}
                </p>
                {app.experience && (
                  <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
                    {app.experience}
                  </p>
                )}
                <p className="mt-1 text-[10px] text-zinc-600">
                  {formatTimeAgo(app.created_at)}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    review({
                      applicationId: app.id as Id<"budtenderApplications">,
                      action: "approve",
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/25"
                >
                  <Check className="h-4 w-4" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() =>
                    review({
                      applicationId: app.id as Id<"budtenderApplications">,
                      action: "reject",
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20"
                >
                  <X className="h-4 w-4" />
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
