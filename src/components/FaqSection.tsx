import { SEO_FAQ } from "@/lib/seo";

export function FaqSection({
  heading = "Frequently asked questions",
  id = "faq",
}: {
  heading?: string;
  id?: string;
}) {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      className="scroll-mt-24"
      aria-labelledby={headingId}
    >
      <h2
        id={headingId}
        className="font-display text-xl font-extrabold uppercase tracking-tight text-[var(--text-main)] sm:text-2xl"
      >
        {heading}
      </h2>
      <dl className="mt-6 space-y-4">
        {SEO_FAQ.map((item) => (
          <div
            key={item.question}
            className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-4 sm:p-5"
          >
            <dt className="font-display text-sm font-bold text-[var(--text-main)] sm:text-base">
              {item.question}
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              {item.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
