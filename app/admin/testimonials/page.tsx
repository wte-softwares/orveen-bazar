import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listAdminTestimonials } from "@/lib/queries/testimonials";
import { TestimonialManagementContent } from "@/components/admin/testimonials/TestimonialManagementContent";

/**
 * Server Component for Customer Feedback / Testimonials Management.
 * Gated to Platform Administrators only.
 */
export default async function AdminTestimonialsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin/testimonials");
  }

  // Security gate: Platform admin access required
  const { data: isAdmin, error: adminCheckError } = await supabase.rpc(
    "is_platform_admin",
    { uid: user.id },
  );

  if (adminCheckError || !isAdmin) {
    redirect("/admin");
  }

  const initialTestimonials = await listAdminTestimonials(supabase);

  return (
    <TestimonialManagementContent
      initialTestimonials={initialTestimonials}
    />
  );
}
