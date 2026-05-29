import { auth, currentUser } from "@clerk/nextjs/server";

function parseList(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function isRequestAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const adminIds = parseList(process.env.ADMIN_USER_IDS);
  if (adminIds.includes(userId)) return true;

  const adminEmails = parseList(process.env.ADMIN_EMAILS).map((e) =>
    e.toLowerCase()
  );
  if (adminEmails.length === 0) return false;

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  return Boolean(email && adminEmails.includes(email));
}
