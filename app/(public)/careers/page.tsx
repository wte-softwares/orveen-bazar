import Link from "next/link";
import Image from "next/image";
import { ChevronRight, MapPin, Mail, Phone, Building2 } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SITE_CONFIG } from "@/lib/site-config";

// Static informational page — hiring is announced via seasonal posters, not
// managed content, so this mirrors the current recruitment campaign
// directly rather than pulling from the catalog/organization data model.
const POSTERS = [
  { src: "/hiring/hiring-poster-1.png", alt: "Orveen Bazaar urgent hiring notice — Area Sales Manager, Field Officer, Unit Manager" },
  { src: "/hiring/hiring-poster-2.png", alt: "Orveen Bazaar Field Officer hiring notice — Barishal, Khulna, Faridpur division" },
  { src: "/hiring/hiring-poster-3.png", alt: "Orveen Bazaar Field Officer hiring notice — role details and eligibility" },
];

const POSITIONS = [
  {
    title: "এরিয়া সেলস ম্যানেজার (ASM)",
    requirements: ["ন্যূনতম BA Pass", "২-৩ বছরের সংশ্লিষ্ট অভিজ্ঞতা (কনজ্যুমার বেভারেজ/কেমিকেল পণ্য, ডিলার/ডিস্ট্রিবিউশন পরিচালনায় পারদর্শী)"],
  },
  {
    title: "ফিল্ড অফিসার",
    requirements: ["পুরুষ / মহিলা উভয়েই আবেদন করতে পারবেন", "ন্যূনতম HSC Pass"],
  },
  {
    title: "ইউনিট ম্যানেজার",
    requirements: ["পুরুষ / মহিলা", "ন্যূনতম HSC Pass"],
  },
];

export default function CareersPage() {
  return (
    <div className="py-8 space-y-8 pb-14">
      <Container className="space-y-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Careers</span>
        </nav>

        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">জরুরি নিয়োগ বিজ্ঞপ্তি</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
            ঢাকা, বরিশাল, খুলনা, ফরিদপুর, রাজশাহী ও ময়মনসিংহ বিভাগের সকল জেলা ও উপজেলা পর্যায়ে
            ই-কমার্স ও রিটেইল মার্কেটিং কার্যক্রমের মাধ্যমে পণ্য বাজারজাতকরণ ও গ্রাহকসেবা সম্প্রসারণের জন্য
            জনবল নিয়োগ দেওয়া হচ্ছে।
          </p>
        </div>
      </Container>

      <Container>
        <div className="grid gap-4 sm:grid-cols-3">
          {POSTERS.map((poster) => (
            <div key={poster.src} className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]">
              <Image src={poster.src} alt={poster.alt} width={853} height={1280} className="h-auto w-full object-contain" />
            </div>
          ))}
        </div>
      </Container>

      <Container className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">পদের নাম ও যোগ্যতা</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {POSITIONS.map((position) => (
            <div key={position.title} className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-sm)]">
              <h3 className="font-bold text-[var(--brand-primary)]">{position.title}</h3>
              <ul className="mt-2 space-y-1 text-sm text-[var(--text-secondary)]">
                {position.requirements.map((req) => (
                  <li key={req} className="flex gap-1.5">
                    <span aria-hidden="true">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      <Container>
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--color-primary-50)] p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">আমরা যা অফার করি</h2>
          <ul className="mt-2 grid gap-1.5 text-sm text-[var(--text-secondary)] sm:grid-cols-2">
            <li>আকর্ষণীয় বেতন ও কমিশন</li>
            <li>উন্নত ক্যারিয়ার সুযোগ</li>
            <li>প্রশিক্ষণ ও দক্ষতা উন্নয়ন</li>
            <li>প্রফেশনাল কাজের পরিবেশ</li>
            <li>কোম্পানির নিজস্ব পণ্য ব্যবহারের সুবিধা</li>
          </ul>
        </div>
      </Container>

      <Container className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">আবেদন / যোগাযোগ</h2>
        <div className="grid gap-3 text-sm text-[var(--text-secondary)] sm:grid-cols-3">
          <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-primary)]" /> {SITE_CONFIG.contact.address}</p>
          <a href={SITE_CONFIG.contact.whatsappHref} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[var(--brand-primary)]">
            <Phone className="h-4 w-4 shrink-0 text-[var(--brand-primary)]" /> WhatsApp: {SITE_CONFIG.contact.phone}
          </a>
          <a href={`mailto:${SITE_CONFIG.contact.email}`} className="flex items-center gap-2 hover:text-[var(--brand-primary)]">
            <Mail className="h-4 w-4 shrink-0 text-[var(--brand-primary)]" /> {SITE_CONFIG.contact.email}
          </a>
        </div>
        <p className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <Building2 className="h-4 w-4 shrink-0 text-[var(--brand-primary)]" /> প্রধান কার্যালয়: CNB Road, Barishal (Shopno-এর নিকটবর্তী বিল্ডিং)
        </p>
      </Container>
    </div>
  );
}
