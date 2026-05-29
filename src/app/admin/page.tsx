import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: "Admin",
  description: "BoofMap admin dashboard.",
  path: "/admin",
  noIndex: true,
});

export default function AdminPage() {
  return <AdminDashboard />;
}
