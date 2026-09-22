import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Phone, Mail } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SITE_CONFIG } from "@/lib/site-config";

// Static informational page mirroring the current dealer/agent recruitment
// campaign posters — see AGENTS.md: no order/checkout logic here, this is
// marketing content only.
const POSTERS = [
  { src: "/dealership/dealership-poster-1.png", alt: "Orveen Bazaar dealer recruitment notice — products and dealer benefits" },
  { src: "/dealership/dealership-poster-2.png", alt: "Orveen Bazaar dealer package program — investment and commission details" },
  { src: "/dealership/dealership-poster-3.png", alt: "Orveen Bazaar entrepreneur wanted — Barishal, Khulna, Faridpur zone" },
  { src: "/dealership/dealership-poster-4.png", alt: "Orveen Bazaar dealer/agent recruitment — business packages and payment partners" },
];

const PACKAGES = ["৫৫০ টাকা", "৮৫০ টাকা", "১,১০০ টাকা", "১,৫৫০ টাকা", "২,৫৫০ টাকা", "ফ্যামিলি প্যাকেজ ৫,০০০ টাকা"];

const BENEFITS = [
  "নির্ধারিত এলাকায় পণ্য বাজারজাতের সুযোগ",
  "কোম্পানির অনুমোদিত কমিশন সুবিধা",
  "Package Program-এর মাধ্যমে ব্যবসার সুযোগ",
  "ধাপে ধাপে পণ্য উত্তোলনের সুবিধা",
  "বিক্রয় ও বাজার সম্প্রসারণে কোম্পানির নীতিমালা অনুযায়ী সহযোগিতা",
];

export default function DealershipPage() {
  return (
    <div className="py-8 space-y-8 pb-14">
      <Container className="space-y-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Dealership</span>
        </nav>

        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">ডিলার / এজেন্ট নিয়োগ চলছে</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
            সারা বাংলাদেশে জেলা, উপজেলা ও থানা পর্যায়ে Orveen Bazaar Package Program ও নিত্যপ্রয়োজনীয়
            পণ্যের ডিলারশিপ ও এজেন্সি নিয়োগ দেওয়া হচ্ছে — বরিশাল, খুলনা ও ফরিদপুর বিভাগ থেকে শুরু করে
            ধাপে ধাপে সারা দেশে সম্প্রসারণের পরিকল্পনায়।
          </p>
        </div>
      </Container>

      <Container>
        <div className="grid gap-4 sm:grid-cols-2">
          {POSTERS.map((poster) => (
            <div key={poster.src} className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]">
              <Image src={poster.src} alt={poster.alt} width={1024} height={1290} className="h-auto w-full object-contain" />
            </div>
          ))}
        </div>
      </Container>

      <Container className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">ডিলারদের জন্য সুবিধা</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-[var(--text-secondary)]">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex gap-1.5">
                <span aria-hidden="true">•</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--color-primary-50)] p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">ব্যবসায়িক প্যাকেজ</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {PACKAGES.map((pkg) => (
              <span key={pkg} className="rounded-full border border-[var(--brand-primary)]/30 bg-[var(--bg-surface)] px-3 py-1 text-sm font-semibold text-[var(--brand-primary)]">
                {pkg}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-[var(--text-secondary)]">
            চূড়ান্ত কমিশন, মূল্য ও পণ্য উত্তোলনের শর্ত কোম্পানির লিখিত ডিলার চুক্তি অনুযায়ী নির্ধারিত হয়।
          </p>
        </div>
      </Container>

      <Container className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">ডিলারশিপের জন্য যোগাযোগ</h2>
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
