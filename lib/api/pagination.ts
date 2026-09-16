import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/constants";

export interface Pagination {
  page: number;
  pageSize: number;
  /** Supabase `.range()` is 0-indexed and inclusive on both ends. */
  from: number;
  to: number;
}

/**
 * Parses `?page` and `?pageSize` from a request's search params with sane
 * defaults and a hard cap, shared by every paginated list endpoint so none
 * of them can be made to return an unbounded number of rows.
 */
export function parsePagination(searchParams: URLSearchParams): Pagination {
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const requestedPageSize = Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(Math.max(1, requestedPageSize), MAX_PAGE_SIZE);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return { page, pageSize, from, to };
}
