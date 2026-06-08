import type { Metadata } from "next";
import { BrandPartnerClient } from "./BrandPartnerClient";

export const metadata: Metadata = {
  title: "Brand Partners — Claim Your Brand | BoofMap",
  description:
    "Join the Cannabis Intelligence Network. Build trust through transparency—not advertising.",
};

export default function BrandPartnerPage() {
  return <BrandPartnerClient />;
}
