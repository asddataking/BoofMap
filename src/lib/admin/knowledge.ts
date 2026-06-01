/**
 * BoofMap admin AI knowledge base.
 * Edit this file to teach the assistant about your product, policies, and workflows.
 */

export type KnowledgeSection = {
  id: string;
  title: string;
  content: string;
};

export const ADMIN_KNOWLEDGE: KnowledgeSection[] = [
  {
    id: "product",
    title: "What is BoofMap",
    content: `BoofMap is a Michigan-focused community cannabis reporting app.
- Tagline: "Find fire. Avoid boof."
- Users browse all approved reports without signing up.
- Sign-up (Clerk) is required to submit reports, vote, and confirm community posts.
- Runs as a PWA — no app store required.
- Two report types: Product/Dispensary reports and Meetup/Seller reports.`,
  },
  {
    id: "boof-score",
    title: "Boof score system",
    content: `Boof score is 1–5 (higher = better):
- 1.0–1.5: Boof Alert — avoid
- 1.5–2.5: Mostly boof
- 2.5–3.5: Mid
- 3.5–4.5: Decent
- 4.5–5.0: Fire

Marker tiers on the map:
- boof (red): low score or serious issues (Mold, CRC Garbage, Leaking Cart)
- taxed (orange): Overpriced / Taxed, Fake Sale
- fire (green): high score, minimal issues
- mid (yellow): everything else`,
  },
  {
    id: "issue-tags",
    title: "Product issue tags",
    content: `Common product issue tags: Mold, Dry, No Flavor, Harsh Smoke, Weak High, Seeds/Stems, Old Package Date, Overpriced / Taxed, Fake Sale, Leaking Cart, CRC Garbage.

Meetup issue tags: No Show, Changed Price, Suspected Scam, Unsafe Meetup, Fake Photos, Shorted Product, Bad Communication, Would Not Recommend.`,
  },
  {
    id: "moderation",
    title: "Moderation workflow",
    content: `Report statuses: pending, approved, rejected, flagged.

Auto-moderation flags content with: phone numbers, street addresses, license plates, emails, profanity, spam length, excessive links. Flagged items go to the moderation queue.

Admin actions:
- Approve: report goes live; product reports get trustScore = boofScore × 20
- Reject: hidden from public feed
- Edit: update strain, brand, dispensary, score, tags, notes, status from Product Reports or Meetup Reports tabs

Meetup reports: approving recalculates publicWarning for that seller + city.`,
  },
  {
    id: "admin-panel",
    title: "Admin panel sections",
    content: `Admin panel at /admin:
- Overview: user counts, report stats, recent signups, moderation summary
- Users: view signups, change roles (user/admin)
- Product Reports: filter, edit, approve/reject, delete
- Meetup Reports: same for street sellers
- Moderation: queue of auto-flagged items needing review
- AI chat (bottom-right): ask questions and run live actions via tools`,
  },
  {
    id: "policies",
    title: "Community policies",
    content: `Do not allow personal legal names in brand/dispensary fields.
Meetup reports must not contain phone numbers, addresses, or legal names.
BoofMap is community-submitted — not verified lab data. Users should inspect products themselves.
Admin accounts are set via ADMIN_USER_IDS and ADMIN_EMAILS env vars in Convex + Next.js.`,
  },
];

export function getKnowledgeForPrompt(topics?: string[]): string {
  const sections =
    topics && topics.length > 0
      ? ADMIN_KNOWLEDGE.filter((s) =>
          topics.some((t) => s.id.includes(t) || s.title.toLowerCase().includes(t))
        )
      : ADMIN_KNOWLEDGE;

  return sections
    .map((s) => `## ${s.title}\n${s.content}`)
    .join("\n\n");
}
