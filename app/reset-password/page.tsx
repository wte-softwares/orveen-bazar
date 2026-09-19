import { createClient } from "@/lib/supabase/server";
import { listActiveTestimonials } from "@/lib/queries/testimonials";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { BackToHomeButton } from "@/components/auth/BackToHomeButton";

// Set a new password after a verified recovery link — see
// app/auth/callback/route.ts (exchanges the emailed link's code for a
// session before the visitor ever reaches this page).
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const testimonials = await listActiveTestimonials(supabase);

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <BackToHomeButton />
      <div className="w-full max-w-sm md:max-w-4xl">
        <ResetPasswordForm testimonials={testimonials} />
      </div>
    </div>
  );
}
