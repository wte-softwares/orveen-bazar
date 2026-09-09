import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Health check that never breaks a build/deploy:
 * - no DATABASE_URL  → 200 with database: "not-configured"
 * - reachable DB     → 200 with database: "connected"
 * - DB error         → 500 with details
 */
export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      ok: true,
      service: "orveen-bazzar",
      database: "not-configured",
    });
  }

  try {
    const { db } = await import("@/db");
    await db.execute(sql`select 1`);
    return NextResponse.json({
      ok: true,
      service: "orveen-bazzar",
      database: "connected",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        service: "orveen-bazzar",
        database: "error",
        message: error instanceof Error ? error.message : "unknown error",
      },
      { status: 500 },
    );
  }
}
