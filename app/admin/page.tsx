import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

// Dashboard — organization switcher and counts of products, services,
// categories, and banners. No revenue/order metrics (out of scope entirely).
export default function AdminDashboardPage() {
  return (
    <ScreenPlaceholder
      title="Admin dashboard"
      route="/admin"
      description="Organization switcher and content counts — no revenue or order metrics."
    />
  );
}
