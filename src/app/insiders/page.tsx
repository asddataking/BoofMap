import type { Metadata } from "next";
import { InsidersClient } from "./InsidersClient";

export const metadata: Metadata = {
  title: "Boof Detection — Cannabis Intelligence Insiders",
  description:
    "Join the Boof Detection Network. Help identify fire, expose boof, and earn status by contributing real product intelligence.",
};

export default function InsidersPage() {
  return <InsidersClient />;
}
