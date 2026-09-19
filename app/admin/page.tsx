import { createClient } from "@/lib/supabase/server";
import { getAdminOverviewStats, listRecentCatalogItemsForAdmin } from "@/lib/queries/admin";
import { OverviewContent } from "@/components/admin/OverviewContent";
import { BRANDS } from "@/lib/site-config";

// Dashboard — organization switcher (in the sidebar) and counts of
// products, categories, and banners. No revenue/order metrics, ever — see
// AGENTS.md, "What this project is explicitly NOT."
export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const [stats, recentItems] = await Promise.all([
    getAdminOverviewStats(supabase),
    listRecentCatalogItemsForAdmin(supabase),
  ]);

  return <OverviewContent orgSlug={BRANDS[0].slug} stats={stats} recentItems={recentItems} />;
}
