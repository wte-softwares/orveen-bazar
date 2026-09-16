import { ZodError } from "zod";
import { fail } from "@/lib/api/response";

/**
 * Typed errors a Route Handler can `throw` from anywhere in its logic —
 * `withApiHandler()` below catches them and maps each to the right HTTP
 * status and machine-readable `code`, so a route's happy path never has to
 * manually construct an error response.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Sign in required.") {
    super(401, "unauthorized", message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "You don't have access to this resource.") {
    super(403, "forbidden", message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Not found.") {
    super(404, "not_found", message);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, "conflict", message);
  }
}

/**
 * Wraps a Route Handler so every route gets the same error-formatting
 * behaviour instead of hand-rolling try/catch per file:
 *   - a thrown ApiError maps to its declared status/code
 *   - a Zod validation failure maps to 422 with per-field messages
 *   - anything else is logged server-side and returned as a generic 500 —
 *     the client NEVER sees the raw error message, which could leak
 *     internal details (query text, file paths, stack traces).
 */
export function withApiHandler<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof ApiError) {
        return fail(error.status, error.code, error.message);
      }

      if (error instanceof ZodError) {
        const fields: Record<string, string> = {};
        for (const issue of error.issues) {
          const key = issue.path.join(".") || "_root";
          // First message per field is enough for a form to highlight it;
          // keeping this simple avoids a wall of text for one bad field.
          if (!fields[key]) fields[key] = issue.message;
        }
        return fail(422, "validation_failed", "Some fields need attention.", fields);
      }

      // Unexpected error: log the real detail server-side only.
      console.error("[api] unhandled error", error);
      return fail(500, "internal_error", "Something went wrong. Please try again.");
    }
  };
}
