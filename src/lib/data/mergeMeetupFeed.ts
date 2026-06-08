import type { MeetupReport } from "@/lib/types";

/** Approved feed + reporter's pending/flagged (deduped, newest first). */
export function mergeMeetupFeed(
  approved: MeetupReport[] | undefined,
  mine: MeetupReport[] | undefined
): MeetupReport[] | undefined {
  if (approved === undefined) return undefined;

  if (!mine?.length) {
    return [...approved].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  const approvedIds = new Set(approved.map((r) => r.id));
  const extra = mine.filter(
    (r) =>
      !approvedIds.has(r.id) &&
      (r.status === "pending" || r.status === "flagged")
  );

  return [...extra, ...approved].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
