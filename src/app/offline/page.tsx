import Link from "next/link";
import { BoofLogo } from "@/components/BoofLogo";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Offline",
  description: "BoofMap is offline. Reconnect to load fresh community reports.",
  path: "/offline",
  noIndex: true,
});

export default function OfflinePage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <BoofLogo size="lg" showBeta={false} className="justify-center" />
      <p className="mt-3 max-w-xs text-sm text-[var(--text-muted)]">
        You&apos;re offline. Reconnect to load fresh community reports.
      </p>
      <Link href="/" className="btn-primary mt-6">
        Open BoofMap
      </Link>
    </div>
  );
}
