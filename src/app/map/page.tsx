import { redirect } from "next/navigation";

/** Map and reports share one intel hub at /reports */
export default function MapPage() {
  redirect("/reports");
}
