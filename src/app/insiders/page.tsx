import type { Metadata } from "next";
import { InsidersClient } from "./InsidersClient";

export const metadata: Metadata = {
  title: "Boof Insiders — Cannabis Intelligence Network",
  description:
    "Join the Boof Insider Network. Help identify fire, expose boof, and earn status by contributing real product intelligence.",
};

export default function InsidersPage() {
  return <InsidersClient />;
}
