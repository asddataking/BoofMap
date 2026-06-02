import {
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
  buildOrganizationJsonLd,
  buildWebApplicationJsonLd,
  buildWebSiteJsonLd,
  SITE_DESCRIPTION_LONG,
} from "@/lib/seo";
import { JsonLdScript } from "./JsonLdScript";

/** Invisible structured data for the homepage (no visible UI). */
export function HomePageJsonLd() {
  return (
    <>
      <JsonLdScript data={buildWebSiteJsonLd()} />
      <JsonLdScript data={buildOrganizationJsonLd()} />
      <JsonLdScript data={buildWebApplicationJsonLd()} />
      <JsonLdScript data={buildFaqJsonLd()} />
      <JsonLdScript
        data={buildCollectionPageJsonLd({
          name: "BoofMap — Cannabis Transparency Platform",
          description: SITE_DESCRIPTION_LONG,
          path: "/",
        })}
      />
    </>
  );
}
