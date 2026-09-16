// Static marketing copy ported from the design — no backend model exists
// for customer testimonials (not part of the brief's scope), so this is
// plain hardcoded content, same as the trust badges in PublicHeader.
const TESTIMONIALS = [
  {
    quote: "Product quality is very good and delivery is very fast. I buy from here regularly.",
    name: "Rakib Ahmed",
    city: "Dhaka",
  },
  {
    quote: "A trustworthy and reliable online shop. Very helpful for the family.",
    name: "Nusrat Jahan",
    city: "Chattogram",
  },
  {
    quote: "Both the product quality and packaging are good. Genuinely satisfied.",
    name: "Tanvir Hasan",
    city: "Khulna",
  },
  {
    quote: "I'm very happy with the nature-friendly products. Eco Fast BD's initiative is truly commendable.",
    name: "Samia Rahman",
    city: "Rajshahi",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-(--container-max) px-[5vw] py-10">
      <h2 className="font-heading text-xl font-bold">What our customers say</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Your trust and love are our biggest achievement.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.name}
            className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 text-sm"
          >
            <p className="text-[var(--text-secondary)]">&ldquo;{t.quote}&rdquo;</p>
            <p className="mt-3 font-semibold">{t.name}</p>
            <p className="text-xs text-[var(--text-muted)]">{t.city}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
