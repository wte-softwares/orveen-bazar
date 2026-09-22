import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Phone, Mail } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SITE_CONFIG } from "@/lib/site-config";

// Static informational page for the current investment plan campaign —
// display-only figures from the client's poster, not a real transaction
// flow (see AGENTS.md: no cart/checkout/orders anywhere in this app).
const PLANS = [
  { lump: "১০,০০০", monthly: "৫০০", total: "২০,০০০" },
  { lump: "২০,০০০", monthly: "১,০০০", total: "৪০,০০০" },
  { lump: "৩০,০০০", monthly: "১,৫০০", total: "৬০,০০০" },
  { lump: "৪০,০০০", monthly: "২,০০০", total: "৮০,০০০" },
  { lump: "৫০,০০০", monthly: "২,৫০০", total: "১,০০,০০০" },
  { lump: "৬০,০০০", monthly: "৩,০০০", total: "১,২০,০০০" },
  { lump: "৭০,০০০", monthly: "৩,৫০০", total: "১,৮০,০০০" },
  { lump: "৮০,০০০", monthly: "৪,০০০", total: "১,৬০,০০০" },
  { lump: "৯০,০০০", monthly: "৪,৫০০", total: "১,৮০,০০০" },
  { lump: "১,০০,০০০", monthly: "৫,০০০", total: "২,০০,০০০" },
];

const FEATURES = ["প্রতিমাসে নিশ্চিত বাজার সুবিধা", "১০০% নিরাপদ ও স্বচ্ছ সিস্টেম", "বিশেষ অফার ও উপহার সুবিধা", "২৪/৭ কাস্টমার সাপোর্ট"];

export default function InvestmentPlanPage() {
  return (
    <div className="py-8 space-y-8 pb-14">
      <Container className="space-y-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Investment Plan</span>
        </nav>

        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">ইনভেস্টমেন্ট প্ল্যান</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
            এককালীন জমা দিন, প্রতি মাসে নিশ্চিত বাজার নিন ৪০ মাস পর্যন্ত।
          </p>
        </div>
      </Container>

      <Container>
        <div className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]">
          <Image src="/investment/investment-plan.png" alt="Orveen Bazaar investment plan — one-time deposit and 40-month guaranteed monthly market allowance table" width={853} height={1280} className="h-auto w-full object-contain" />
        </div>
      </Container>

      <Container>
        <div className="overflow-x-auto rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="bg-[var(--color-primary-50)] text-left text-[var(--text-primary)]">
                <th className="px-4 py-2.5 font-bold">এককালীন জমা</th>
                <th className="px-4 py-2.5 font-bold">প্রতি মাসের বাজার</th>
                <th className="px-4 py-2.5 font-bold">মেয়াদ</th>
                <th className="px-4 py-2.5 font-bold">৪০ মাসে মোট বাজার</th>
              </tr>
            </thead>
            <tbody>
              {PLANS.map((plan) => (
                <tr key={plan.lump} className="border-t border-[var(--border-default)] text-[var(--text-secondary)]">
                  <td className="px-4 py-2.5 font-semibold text-[var(--text-primary)]">৳{plan.lump}</td>
                  <td className="px-4 py-2.5">৳{plan.monthly}</td>
                  <td className="px-4 py-2.5">৪০ মাস</td>
                  <td className="px-4 py-2.5 font-semibold text-[var(--brand-primary)]">৳{plan.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>

      <Container>
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--color-primary-50)] p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">আমাদের বৈশিষ্ট্য</h2>
          <ul className="mt-2 grid gap-1.5 text-sm text-[var(--text-secondary)] sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex gap-1.5">
                <span aria-hidden="true">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <Container className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">বিস্তারিত জানতে যোগাযোগ করুন</h2>
        <div className="grid gap-3 text-sm text-[var(--text-secondary)] sm:grid-cols-2">
          <a href={SITE_CONFIG.contact.whatsappHref} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[var(--brand-primary)]">
            <Phone className="h-4 w-4 shrink-0 text-[var(--brand-primary)]" /> WhatsApp: {SITE_CONFIG.contact.phone}
          </a>
          <a href={`mailto:${SITE_CONFIG.contact.email}`} className="flex items-center gap-2 hover:text-[var(--brand-primary)]">
            <Mail className="h-4 w-4 shrink-0 text-[var(--brand-primary)]" /> {SITE_CONFIG.contact.email}
          </a>
        </div>
      </Container>
    </div>
  );
}
