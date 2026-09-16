import { NextResponse } from "next/server";

/**
 * Every `/api/v1/*` route responds with this shape so web and mobile clients
 * can rely on one consistent envelope instead of guessing per-endpoint.
 */
export interface ApiSuccess<T> {
  data: T;
  error: null;
  meta?: Record<string, unknown>;
}

export interface ApiFailure {
  data: null;
  error: {
    code: string;
    message: string;
    /** Present for validation failures — field name -> human-readable issue. */
    fields?: Record<string, string>;
  };
  meta?: Record<string, unknown>;
}

export function ok<T>(
  data: T,
  init?: { status?: number; meta?: Record<string, unknown> },
) {
  const body: ApiSuccess<T> = { data, error: null, meta: init?.meta };
  return NextResponse.json(body, { status: init?.status ?? 200 });
}

export function fail(
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string>,
) {
  const body: ApiFailure = { data: null, error: { code, message, fields } };
  return NextResponse.json(body, { status });
}

/**
 * Placeholder response for routes whose real implementation lands in Phase 2
 * (see docs/ARCHITECTURE.md and AGENTS.md). Keeps the route tree and its
 * public URL shape real and navigable during Phase 1 without faking business
 * logic that doesn't exist yet.
 */
export function notImplemented(routeDescription: string) {
  return fail(
    501,
    "not_implemented",
    `${routeDescription} is not implemented yet.`,
  );
}
