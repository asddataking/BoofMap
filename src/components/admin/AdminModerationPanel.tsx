"use client";

import { useMutation, useQuery } from "convex/react";
import { Check, Image, X } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { AdminPageHeader } from "./AdminShell";
import type { ModerationQueueItem } from "@/lib/types";

export function AdminModerationPanel() {
  const queue = useQuery(api.admin.listModerationQueue) as
    | ModerationQueueItem[]
    | undefined;
  const moderate = useMutation(api.admin.moderate);

  const handleAction = async (
    item: ModerationQueueItem,
    action: "approve" | "reject"
  ) => {
    await moderate({
      sourceType: item.source_type,
      sourceId: item.source_id,
      queueId: item.id as Id<"moderationQueue">,
      action,
    });
  };

  return (
    <div>
      <AdminPageHeader
        title="Moderation queue"
        description="Review auto-flagged content before it goes live."
      />

      <div className="space-y-4">
        {(queue ?? []).map((item) => (
          <div
            key={item.id}
            className="glass-card border-l-4 border-l-amber-500/50 p-5"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-medium uppercase text-zinc-400">
                {item.source_type}
              </span>
              {item.reasons.map((reason) => (
                <span
                  key={reason}
                  className="rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-300"
                >
                  {reason}
                </span>
              ))}
            </div>

            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              {item.preview_text}
            </p>

            {item.image_url && (
              <a
                href={item.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300"
              >
                <Image className="h-3.5 w-3.5" />
                View attached image
              </a>
            )}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => handleAction(item, "approve")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/30"
              >
                <Check className="h-4 w-4" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => handleAction(item, "reject")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-500/20 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/30"
              >
                <X className="h-4 w-4" />
                Reject
              </button>
            </div>
          </div>
        ))}

        {!queue?.length && (
          <div className="glass-card p-12 text-center">
            <p className="text-zinc-400">Moderation queue is empty.</p>
            <p className="mt-1 text-sm text-zinc-600">
              Flagged content will appear here automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
