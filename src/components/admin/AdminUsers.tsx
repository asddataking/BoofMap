"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { AdminPageHeader } from "./AdminShell";
import { formatTimeAgo } from "@/lib/utils";

export function AdminUsers() {
  const users = useQuery(api.admin.listUsers, { limit: 100 });
  const updateRole = useMutation(api.admin.updateUserRole);

  const handleRoleChange = async (
    userId: string,
    role: "user" | "admin"
  ) => {
    await updateRole({ userId: userId as Id<"users">, role });
  };

  return (
    <div>
      <AdminPageHeader
        title="Users"
        description="Community members who signed up via Clerk."
      />

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-soft)] text-xs uppercase tracking-wider text-[var(--text-muted)]">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Clerk ID</th>
                <th className="px-4 py-3 font-medium">Reports</th>
                <th className="px-4 py-3 font-medium">Reputation</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-zinc-900/80 transition hover:bg-[var(--bg-elevated)]"
                >
                  <td className="px-4 py-3 font-medium text-[var(--text-main)]">
                    {user.display_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--text-muted)]">
                    {user.clerk_id.slice(0, 16)}…
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">
                    {user.report_count}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">
                    {user.reputation}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                    {formatTimeAgo(user.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(
                          user.id,
                          e.target.value as "user" | "admin"
                        )
                      }
                      className="rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elevated)] px-2 py-1 text-xs text-[var(--text-main)] focus:border-emerald-500/40 focus:outline-none"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!users?.length && (
          <p className="p-6 text-center text-sm text-[var(--text-muted)]">
            No users synced yet. Users appear after their first sign-in.
          </p>
        )}
      </div>
    </div>
  );
}
