import type { TestimonialRow } from "@/lib/queries/testimonials";
import type { LocalizedText } from "@/lib/site-config";

export type { TestimonialRow };

/** Reshapes a flat `testimonials` row (bn/en columns) into the `LocalizedText` shape the UI's `pickLocalized()` helper expects. */
export function testimonialToLocalizedText(row: TestimonialRow): {
  quote: LocalizedText;
  name: LocalizedText;
  city: LocalizedText;
} {
  return {
    quote: { bn: row.quote_bn, en: row.quote_en },
    name: { bn: row.name_bn, en: row.name_en },
    city: { bn: row.city_bn, en: row.city_en },
  };
}
