"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { AdminPageHeader, StatusBadge } from "./AdminShell";
import { ISSUE_TAGS } from "@/lib/constants";
import type { ReportStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type AdminReport = {
  id: string;
  strain_name: string;
  brand_name: string;
  dispensary_name: string;
  city: string;
  product_type: string;
  boof_score: number;
  notes?: string | null;
  price_paid?: number | null;
  issue_tags: string[];
  status?: ReportStatus;
  moderation_flags?: string[];
  image_url?: string | null;
  created_at: string;
};

const statuses: (ReportStatus | "all")[] = [
  "all",
  "pending",
  "flagged",
  "approved",
  "rejected",
];

export function AdminReportsPanel() {
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");
  const [editing, setEditing] = useState<AdminReport | null>(null);

  const reports = useQuery(api.admin.listAllReports, {
    status: statusFilter === "all" ? undefined : statusFilter,
    limit: 100,
  }) as AdminReport[] | undefined;

  const updateReport = useMutation(api.admin.updateReport);
  const deleteReport = useMutation(api.admin.deleteReport);
  const moderate = useMutation(api.admin.moderate);

  const handleQuickAction = async (
    id: string,
    action: "approve" | "reject"
  ) => {
    await moderate({
      sourceType: "report",
      sourceId: id,
      action,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this report permanently?")) return;
    await deleteReport({ reportId: id as Id<"reports"> });
    setEditing(null);
  };

  return (
    <div>
      <AdminPageHeader
        title="Product reports"
        description="View, edit, approve, or reject dispensary reports."
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
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
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
                  {report.strain_name}
                </h3>
                {report.status && <StatusBadge status={report.status} />}
              </div>
              <p className="mt-1 text-sm text-zinc-400">
                {report.brand_name} · {report.dispensary_name} · {report.city}
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                Score {report.boof_score}/5 · {report.product_type}
                {report.issue_tags.length > 0 &&
                  ` · ${report.issue_tags.join(", ")}`}
              </p>
              {report.notes && (
                <p className="mt-2 line-clamp-2 text-sm text-zinc-500">
                  {report.notes}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setEditing(report)}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
              {(report.status === "pending" || report.status === "flagged") && (
                <>
                  <button
                    type="button"
                    onClick={() => handleQuickAction(report.id, "approve")}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs text-emerald-300"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAction(report.id, "reject")}
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
          <p className="text-center text-sm text-zinc-500">No reports found.</p>
        )}
      </div>

      {editing && (
        <EditReportDrawer
          report={editing}
          onClose={() => setEditing(null)}
          onSave={async (data) => {
            await updateReport({
              reportId: editing.id as Id<"reports">,
              ...data,
            });
            setEditing(null);
          }}
          onDelete={() => handleDelete(editing.id)}
        />
      )}
    </div>
  );
}

function EditReportDrawer({
  report,
  onClose,
  onSave,
  onDelete,
}: {
  report: AdminReport;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onDelete: () => void;
}) {
  const [form, setForm] = useState({
    strainName: report.strain_name,
    brandName: report.brand_name,
    dispensaryName: report.dispensary_name,
    city: report.city,
    productType: report.product_type,
    boofScore: report.boof_score,
    notes: report.notes ?? "",
    pricePaid: report.price_paid ?? "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        strainName: form.strainName,
        brandName: form.brandName,
        dispensaryName: form.dispensaryName,
        city: form.city,
        productType: form.productType,
        boofScore: Number(form.boofScore),
        notes: form.notes || undefined,
        pricePaid: form.pricePaid ? Number(form.pricePaid) : undefined,
        issueTags: form.issueTags,
        status: form.status,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <h3 className="font-heading text-lg font-bold text-white">Edit report</h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {(
            [
              ["strainName", "Strain"],
              ["brandName", "Brand"],
              ["dispensaryName", "Dispensary"],
              ["city", "City"],
              ["productType", "Product type"],
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Boof score</label>
              <input
                type="number"
                min={1}
                max={5}
                step={0.5}
                className="form-input mt-1"
                value={form.boofScore}
                onChange={(e) =>
                  setForm((f) => ({ ...f, boofScore: Number(e.target.value) }))
                }
              />
            </div>
            <div>
              <label className="form-label">Price paid</label>
              <input
                type="number"
                className="form-input mt-1"
                value={form.pricePaid}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pricePaid: e.target.value }))
                }
              />
            </div>
          </div>

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
              {ISSUE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs",
                    form.issueTags.includes(tag)
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-zinc-800 text-zinc-500"
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
              className="form-input mt-1 min-h-[80px] resize-y"
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1 rounded-2xl border border-red-500/30 px-4 py-3 text-sm text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
