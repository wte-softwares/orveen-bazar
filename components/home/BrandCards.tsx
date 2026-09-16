import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { publicAssetUrl } from "@/lib/storage/public-url";

export interface BrandCardOrg {
  slug: string;
  name: string;
  description: string | null;
  logo_path: string | null;
}

const TAGLINES: Record<string, string> = {
  "orveen-bazar": "Natural Choices, Better Life",
  "eco-fast-bd": "Bringing Nature Closer, Faster",
  "reliable-multi-products": "Trusted Products, Better Choice",
};

/** No interactivity — safe as a Server Component, rendered directly by the family homepage. */
export function BrandCards({ organizations }: { organizations: BrandCardOrg[] }) {
  return (
    <section id="brands" className="mx-auto max-w-(--container-max) px-[5vw] py-10">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold">Our Brands</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Three trusted brands under one roof, for every need in your family.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {organizations.map((org) => (
          <div
            key={org.slug}
            className="flex flex-col items-start gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5"
          >
            {org.logo_path ? (
              <Image
                src={publicAssetUrl(org.logo_path)}
                alt={`${org.name} logo`}
                width={56}
                height={56}
                className="h-14 w-14 rounded-xl object-cover"
              />
            ) : null}
            <div>
              <p className="font-heading text-base font-bold">{org.name}</p>
              <p className="text-xs font-medium text-[var(--brand-secondary)]">
                {TAGLINES[org.slug] ?? ""}
              </p>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">{org.description}</p>
            <Link
              href={`/brands/${org.slug}`}
              className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand-primary)] hover:underline"
            >
              Browse <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
