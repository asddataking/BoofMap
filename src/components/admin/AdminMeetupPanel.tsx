"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { AdminPageHeader, StatusBadge } from "./AdminShell";
import { MEETUP_ISSUE_TAGS } from "@/lib/constants";
import type { MeetupType, ReportStatus, SellerSignal } from "@/lib/types";
import { cn } from "@/lib/utils";

type AdminMeetup = {
  id: string;
  seller_display_name: string;
  platform: string;
  city: string;
  area?: string | null;
  meetup_type: MeetupType;
  issue_tags: string[];
  seller_signal: SellerSignal;
  notes?: string | null;
  status?: ReportStatus;
  created_at: string;
};

export function AdminMeetupPanel() {
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");
  const [editing, setEditing] = useState<AdminMeetup | null>(null);

  const reports = useQuery(api.admin.listAllMeetupReports, {
    status: statusFilter === "all" ? undefined : statusFilter,
    limit: 100,
  }) as AdminMeetup[] | undefined;

  const updateMeetup = useMutation(api.admin.updateMeetupReport);
  const deleteMeetup = useMutation(api.admin.deleteMeetupReport);
  const moderate = useMutation(api.admin.moderate);

  const statuses: (ReportStatus | "all")[] = [
    "all",
    "pending",
    "flagged",
    "approved",
    "rejected",
  ];

  return (
    <div>
      <AdminPageHeader
        title="Meetup reports"
        description="Manage street seller and meetup reports."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium capitalize",
              statusFilter === s
                ? "bg-purple-500/20 text-purple-300"
                : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {(reports ?? []).map((report) => (
          <div
            key={report.id}
            className="glass-card flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-heading font-semibold text-white">
                  {report.seller_display_name}
                </h3>
                {report.status && <StatusBadge status={report.status} />}
              </div>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {report.platform} · {report.city}
                {report.area ? ` · ${report.area}` : ""}
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Signal: {report.seller_signal} · {report.meetup_type}
              </p>
              {report.notes && (
                <p className="mt-2 line-clamp-2 text-sm text-[var(--text-muted)]">
                  {report.notes}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setEditing(report)}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-soft)] px-3 py-1.5 text-xs text-[var(--text-main)] hover:bg-[var(--bg-elevated)]"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
              {(report.status === "pending" || report.status === "flagged") && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      moderate({
                        sourceType: "meetupReport",
                        sourceId: report.id,
                        action: "approve",
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs text-emerald-300"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      moderate({
                        sourceType: "meetupReport",
                        sourceId: report.id,
                        action: "reject",
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs text-red-300"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {!reports?.length && (
          <p className="text-center text-sm text-[var(--text-muted)]">No meetup reports.</p>
        )}
      </div>

      {editing && (
        <EditMeetupDrawer
          report={editing}
          onClose={() => setEditing(null)}
          onSave={async (data) => {
            await updateMeetup({
              reportId: editing.id as Id<"meetupReports">,
              ...data,
            });
            setEditing(null);
          }}
          onDelete={async () => {
            if (!confirm("Delete this meetup report?")) return;
            await deleteMeetup({
              reportId: editing.id as Id<"meetupReports">,
            });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function EditMeetupDrawer({
  report,
  onClose,
  onSave,
  onDelete,
}: {
  report: AdminMeetup;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onDelete: () => void;
}) {
  const [form, setForm] = useState({
    sellerDisplayName: report.seller_display_name,
    platform: report.platform,
    city: report.city,
    area: report.area ?? "",
    meetupType: report.meetup_type,
    sellerSignal: report.seller_signal,
    notes: report.notes ?? "",
    issueTags: report.issue_tags,
    status: report.status ?? "pending",
  });
  const [saving, setSaving] = useState(false);

  const toggleTag = (tag: string) => {
    setForm((f) => ({
      ...f,
      issueTags: f.issueTags.includes(tag)
        ? f.issueTags.filter((t) => t !== tag)
        : [...f.issueTags, tag],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-[var(--border-soft)] bg-[var(--bg-panel)] p-6">
        <h3 className="font-heading text-lg font-bold text-white">
          Edit meetup report
        </h3>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            try {
              await onSave({
                sellerDisplayName: form.sellerDisplayName,
                platform: form.platform,
                city: form.city,
                area: form.area || undefined,
                meetupType: form.meetupType,
                sellerSignal: form.sellerSignal,
                notes: form.notes || undefined,
                issueTags: form.issueTags,
                status: form.status,
              });
            } finally {
              setSaving(false);
            }
          }}
          className="mt-4 space-y-4"
        >
          {(
            [
              ["sellerDisplayName", "Seller name"],
              ["platform", "Platform"],
              ["city", "City"],
              ["area", "Area"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="form-label">{label}</label>
              <input
                className="form-input mt-1"
                value={form[key]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
              />
            </div>
          ))}

          <div>
            <label className="form-label">Status</label>
            <select
              className="form-input mt-1"
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: e.target.value as ReportStatus,
                }))
              }
            >
              {(["pending", "flagged", "approved", "rejected"] as const).map(
                (s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="form-label">Issue tags</label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {MEETUP_ISSUE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs",
                    form.issueTags.includes(tag)
                      ? "bg-purple-500/20 text-purple-300"
                      : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Notes</label>
            <textarea
              className="form-input mt-1 min-h-[80px]"
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-2xl border border-red-500/30 px-4 text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
