import { buildFaqJsonLd, buildOrganizationJsonLd, buildWebApplicationJsonLd } from "@/lib/seo";
import { JsonLdScript } from "./JsonLdScript";

/** Invisible structured data for the homepage (no visible UI). */
export function HomePageJsonLd() {
  return (
    <>
      <JsonLdScript data={buildOrganizationJsonLd()} />
      <JsonLdScript data={buildWebApplicationJsonLd()} />
      <JsonLdScript data={buildFaqJsonLd()} />
    </>
  );
}
