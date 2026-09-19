import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { listActiveTestimonials } from "@/lib/queries/testimonials";
import { LoginForm } from "@/components/login-form";
import { BackToHomeButton } from "@/components/auth/BackToHomeButton";

// Email/password login (with Google/Facebook OAuth), "forgot password" link,
// and return-to-intended-page support (?redirect=) for the guest-wishlist-
// through-login flow described in docs/ARCHITECTURE.md.
export default async function LoginPage() {
  const supabase = await createClient();
  const testimonials = await listActiveTestimonials(supabase);

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <BackToHomeButton />
      <div className="w-full max-w-sm md:max-w-4xl">
        {/* useSearchParams (for ?redirect=) requires a Suspense boundary. */}
        <Suspense>
          <LoginForm testimonials={testimonials} />
        </Suspense>
      </div>
    </div>
  );
}
