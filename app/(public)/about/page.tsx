import Link from "next/link";
import { ChevronRight, Mail, Globe, Phone } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SITE_CONFIG } from "@/lib/site-config";

const MISSION = [
  "মানসম্মত ও নিরাপদ পণ্য সরবরাহ করা।",
  "গ্রাহকদের জন্য প্রতিযোগিতামূলক মূল্য নিশ্চিত করা।",
  "দেশব্যাপী শক্তিশালী ডিলার ও ডিস্ট্রিবিউশন নেটওয়ার্ক তৈরি করা।",
  "দ্রুত ও নির্ভরযোগ্য সরবরাহ ব্যবস্থা গড়ে তোলা।",
  "উন্নত গ্রাহকসেবা নিশ্চিত করা।",
  "ব্যবসায়িক অংশীদারদের জন্য দীর্ঘমেয়াদি সুযোগ তৈরি করা।",
];

const VALUES = ["সততা", "বিশ্বস্ততা", "গুণগত মান", "উদ্ভাবন", "গ্রাহক সন্তুষ্টি", "দায়বদ্ধতা"];

const PRODUCT_CATEGORIES = [
  { title: "Food & Edible Products", items: ["সয়াবিন তেল", "সরিষার তেল", "চাল", "আটা", "চিনি", "ডাল", "মসলা"] },
  { title: "Household Products", items: ["ডিটারজেন্ট", "ডিশওয়াশ লিকুইড", "মশার কয়েল", "অন্যান্য গৃহস্থালি পণ্য"] },
  { title: "Beverage Products", items: ["জুস", "এনার্জি ড্রিংকস", "পানীয় জল"] },
];

export default function AboutPage() {
  return (
    <div className="py-8 space-y-8 pb-14">
      <Container className="space-y-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">About</span>
        </nav>

        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">RELIABLE MULTI PRODUCTS</h1>
          <p className="mt-1 text-sm font-semibold text-[var(--brand-primary)]">
            ORVEEN BAZZAR.COM &middot; ECO FAST BD
          </p>
          <p className="mt-3 max-w-2xl text-sm text-[var(--text-secondary)]">
            &ldquo;নির্ভরযোগ্য মান • বিশ্বস্ত সেবা • সমৃদ্ধ ভবিষ্যৎ&rdquo;
          </p>
        </div>
      </Container>

      <Container className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">আমাদের সম্পর্কে</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-[var(--text-secondary)]">
          RELIABLE MULTI PRODUCTS একটি বাংলাদেশভিত্তিক FMCG ও নিত্যপ্রয়োজনীয় পণ্য বাজারজাতকারী প্রতিষ্ঠান।
          ORVEEN BAZZAR.COM-এর মাধ্যমে খাদ্যপণ্য, ভোজ্য তেল, পানীয়, গৃহস্থালি পণ্য এবং অন্যান্য নিত্যপ্রয়োজনীয়
          পণ্য গ্রাহকদের কাছে পৌঁছে দেওয়ার লক্ষ্য নিয়ে আমরা কাজ করছি। আমাদের ব্যবসার মূল ভিত্তি হলো — গুণগত
          মান, সাশ্রয়ী মূল্য, নির্ভরযোগ্য সরবরাহ এবং গ্রাহকসেবা।
        </p>
      </Container>

      <Container>
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--color-primary-50)] p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">প্রতিষ্ঠাতার বক্তব্য</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--text-secondary)]">
            RELIABLE MULTI PRODUCTS, ORVEEN BAZZAR.COM এবং ECO FAST BD-এর লক্ষ্য হলো বাংলাদেশের মানুষের
            জন্য মানসম্মত, নিরাপদ ও সাশ্রয়ী নিত্যপ্রয়োজনীয় পণ্য সরবরাহ করা। আমরা শুধু পণ্য বিক্রির দিকে নয়,
            বরং গ্রাহক, ডিলার, ডিস্ট্রিবিউটর ও ব্যবসায়িক অংশীদারদের সঙ্গে দীর্ঘমেয়াদি আস্থা ও পারস্পরিক
            উন্নয়নের সম্পর্ক গড়ে তোলার দিকে গুরুত্ব দিই।
          </p>
          <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">— Md. Mahidul Islam, Founder &amp; Chairman</p>
          <p className="text-xs text-[var(--text-secondary)]">
            Business Development Executive, Rupali Life Insurance Company Ltd. &middot; Agent Banking, Mutual Trust Bank PLC
          </p>
        </div>
      </Container>

      <Container className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Vision</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            বাংলাদেশের অন্যতম বিশ্বস্ত ও শীর্ষস্থানীয় FMCG ব্র্যান্ড হিসেবে প্রতিষ্ঠিত হওয়া এবং ভবিষ্যতে
            আন্তর্জাতিক বাজারে প্রবেশ করা।
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Mission</h2>
          <ul className="mt-2 space-y-1 text-sm text-[var(--text-secondary)]">
            {MISSION.map((line) => (
              <li key={line} className="flex gap-1.5">
                <span aria-hidden="true">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <Container>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">আমাদের মূল মূল্যবোধ</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {VALUES.map((value) => (
            <span key={value} className="rounded-full border border-[var(--brand-primary)]/30 bg-[var(--color-primary-50)] px-3 py-1 text-sm font-semibold text-[var(--brand-primary)]">
              {value}
            </span>
          ))}
        </div>
      </Container>

      <Container className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">আমাদের পণ্যসমূহ</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {PRODUCT_CATEGORIES.map((category) => (
            <div key={category.title} className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-sm)]">
              <h3 className="font-bold text-[var(--brand-primary)]">{category.title}</h3>
              <ul className="mt-2 space-y-1 text-sm text-[var(--text-secondary)]">
                {category.items.map((item) => (
                  <li key={item} className="flex gap-1.5">
                    <span aria-hidden="true">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      <Container className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">কার্যক্রমের স্থান</h2>
        <div className="grid gap-3 text-sm text-[var(--text-secondary)] sm:grid-cols-2">
          <p><span className="font-semibold text-[var(--text-primary)]">কারখানা/উৎপাদন:</span> সানারপাড়, সিদ্ধিরগঞ্জ, নারায়ণগঞ্জ</p>
          <p><span className="font-semibold text-[var(--text-primary)]">ব্যবসায়িক কার্যক্রম:</span> আটি বাজার, বসিলা, মোহাম্মদপুর, ঢাকা</p>
        </div>
      </Container>

      <Container>
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--color-primary-50)] p-5 text-center">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            &ldquo;বিশ্বাসের সঙ্গে এগিয়ে চলুন — RELIABLE MULTI PRODUCTS-এর সঙ্গে গড়ুন সমৃদ্ধ ভবিষ্যৎ।&rdquo;
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-[var(--text-secondary)]">
            <a href={SITE_CONFIG.contact.whatsappHref} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[var(--brand-primary)]">
              <Phone className="h-4 w-4" /> {SITE_CONFIG.contact.phone}
            </a>
            <a href={`mailto:${SITE_CONFIG.contact.email}`} className="flex items-center gap-2 hover:text-[var(--brand-primary)]">
              <Mail className="h-4 w-4" /> {SITE_CONFIG.contact.email}
            </a>
            <a href={SITE_CONFIG.socialLinks.find((s) => s.label === "Website")?.href} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[var(--brand-primary)]">
              <Globe className="h-4 w-4" /> www.orveenbazzar.com
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
}
