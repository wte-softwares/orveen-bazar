import { Badge } from "@/components/ui/badge";

/**
 * Temporary placeholder body for a screen whose real UI is built later, once
 * the client's UI/UX designs and the Phase 2 API are both ready. Every route
 * in the brief's screen map renders one of these for now so the app is fully
 * navigable end-to-end during Phase 1/2 instead of 404ing.
 *
 * Delete this component's usage (not necessarily the component itself — it's
 * handy for any future placeholder need) screen by screen as real UI lands.
 */
export function ScreenPlaceholder({
  title,
  route,
  description,
}: {
  title: string;
  /** The route pattern this stands in for, e.g. "/brands/[brand]/[item]". */
  route: string;
  description?: string;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start gap-3 px-4 py-16">
      <Badge variant="secondary">Scaffold placeholder</Badge>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description ? (
        <p className="text-muted-foreground">{description}</p>
      ) : null}
      <p className="text-muted-foreground font-mono text-sm">{route}</p>
    </div>
  );
}
