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
              <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
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
                  className="border-b border-zinc-900/80 transition hover:bg-zinc-900/30"
                >
                  <td className="px-4 py-3 font-medium text-zinc-200">
                    {user.display_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                    {user.clerk_id.slice(0, 16)}…
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {user.report_count}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {user.reputation}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
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
                      className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-300 focus:border-emerald-500/40 focus:outline-none"
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
          <p className="p-6 text-center text-sm text-zinc-500">
            No users synced yet. Users appear after their first sign-in.
          </p>
        )}
      </div>
    </div>
  );
}
