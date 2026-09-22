import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/layout/Container";

// Static promotional page — this is a free-gift-with-purchase announcement,
// not a purchasable catalog item, so it lives outside the real catalog
// offer filter (`/catalog?offer=true`) rather than faking a database row
// for it. See AGENTS.md: price is display-only, nothing here is a cart or
// order flow.
export default function OffersPage() {
  return (
    <div className="py-8 space-y-6 pb-14">
      <Container className="space-y-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Offers</span>
        </nav>

        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">বিশেষ অফার</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
            অরভিন বাজারের গ্রাহক হলেই আকর্ষণীয় Orveen মনোগ্রাম সম্বলিত মগ সম্পূর্ণ ফ্রি!
          </p>
        </div>
      </Container>

      <Container>
        <div className="mx-auto max-w-md overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]">
          <Image src="/offers/mug-offer.png" alt="Orveen Bazaar free gift offer — branded mug free for customers" width={1024} height={1290} className="h-auto w-full object-contain" />
        </div>
      </Container>

      <Container>
        <p className="text-center text-sm text-[var(--text-secondary)]">
          ছোট কেনাকাটায় বড় আনন্দ — আজই ORVEEN BAZAR.COM-এর সঙ্গে থাকুন।
        </p>
      </Container>
    </div>
  );
}
