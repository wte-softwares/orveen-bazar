import Link from "next/link";
import { Button } from "@/components/ui/button";

// Global not-found — also what renders whenever a page calls notFound()
// for a missing/archived/unpublished item (see the item-details and
// brand-page comments for when that applies).
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground">
        The page you&rsquo;re looking for doesn&rsquo;t exist or is no longer available.
      </p>
      <Button nativeButton={false} render={<Link href="/">Back to home</Link>} />
    </div>
  );
}
