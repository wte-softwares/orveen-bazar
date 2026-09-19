import { createClient } from "@/lib/supabase/server";
import { listActiveTestimonials } from "@/lib/queries/testimonials";
import { SignupForm } from "@/components/signup-form";
import { BackToHomeButton } from "@/components/auth/BackToHomeButton";

// Name, email, password, validation, and email-confirmation state. Wired to
// POST /api/v1/auth/register; confirmation emails land in local Inbucket
// during development (see docs/SETUP.md).
export default async function RegisterPage() {
  const supabase = await createClient();
  const testimonials = await listActiveTestimonials(supabase);

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <BackToHomeButton />
      <div className="w-full max-w-sm md:max-w-4xl">
        <SignupForm testimonials={testimonials} />
      </div>
    </div>
  );
}
