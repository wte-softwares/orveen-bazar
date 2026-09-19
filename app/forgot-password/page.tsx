import { createClient } from "@/lib/supabase/server";
import { listActiveTestimonials } from "@/lib/queries/testimonials";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { BackToHomeButton } from "@/components/auth/BackToHomeButton";

// Request a password-reset link. Always shows the same success message
// whether or not the email exists — see app/api/v1/auth/forgot-password.
export default async function ForgotPasswordPage() {
  const supabase = await createClient();
  const testimonials = await listActiveTestimonials(supabase);

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <BackToHomeButton />
      <div className="w-full max-w-sm md:max-w-4xl">
        <ForgotPasswordForm testimonials={testimonials} />
      </div>
    </div>
  );
}
