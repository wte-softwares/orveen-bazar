import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listActiveTestimonials } from "@/lib/queries/testimonials";
import { Testimonials } from "@/components/home/Testimonials";
import { Container } from "@/components/layout/Container";
import { translate } from "@/lib/i18n/translations";
import { defaultLocale } from "@/lib/i18n/config";

export default async function TestimonialsPage() {
  const supabase = await createClient();
  const testimonials = await listActiveTestimonials(supabase);

  return (
    <div className="py-8 space-y-6">
      <Container className="space-y-4">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">
            {translate("testimonials", "heading", defaultLocale)}
          </span>
        </nav>
      </Container>

      <Testimonials testimonials={testimonials} />
    </div>
  );
}
