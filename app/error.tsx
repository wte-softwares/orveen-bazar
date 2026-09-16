"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Global error boundary. Never render `error.message` from an unexpected
// server error directly to the user — it can leak internal details. Only
// Zod/validation errors (handled inline in forms via the API's structured
// `error.fields`, not this boundary) are safe to show verbatim.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Placeholder until real server-side error reporting exists (Phase 2) —
    // never surface `error` details to the user, only to developer tooling.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="text-muted-foreground">
        Please try again. If the problem continues, contact support.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
