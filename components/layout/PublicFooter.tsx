/**
 * Minimal placeholder footer — see components/layout/PublicHeader.tsx for why
 * this stays deliberately plain during Phase 1/2.
 */
export function PublicFooter() {
  return (
    <footer className="border-t">
      <div className="text-muted-foreground mx-auto max-w-6xl px-4 py-6 text-sm">
        © {new Date().getFullYear()} ORVEEN BAZAR · ECO FAST BD · RELIABLE MULTI PRODUCTS
      </div>
    </footer>
  );
}
