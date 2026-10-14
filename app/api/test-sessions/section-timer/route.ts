import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { openIstSection } from "@/lib/queries/test-sessions";
import { logRouteError } from "@/lib/log-error";
import { positiveId } from "@/lib/validators/test-attempt";

/** Neon is in ap-southeast-1. vercel.json sets the same default for every function. */
export const preferredRegion = "sin1";

const body = z.object({
  token: z.string().uuid(),
  session_id: positiveId,
  section: z.string().trim().min(2).max(4).optional(),
});

function timed(started: number, payload: unknown, status = 200) {
  const res = NextResponse.json(payload, { status });
  res.headers.set("Server-Timing", `app;dur=${Math.max(0, Math.round(performance.now() - started))}`);
  return res;
}

// POST /api/test-sessions/section-timer — one statement reads or starts a subtest clock.
export async function POST(req: NextRequest) {
  const started = performance.now();
  try {
    const { token, session_id, section } = body.parse(await req.json());
    const result = await openIstSection(token, session_id, section ?? null);
    if (result.action === "missing") return timed(started, { error: "not_found" }, 404);
    if (result.action === "completed") return timed(started, { error: "completed" }, 409);
    if (result.action === "not_confirmed") return timed(started, { error: "not_confirmed" }, 403);
    if (result.action === "not_sectioned") return timed(started, { error: "not_sectioned" }, 400);
    if (result.action === "timer_unavailable" || result.action === "config_unavailable") {
      return timed(started, { error: result.action }, 409);
    }
    if (result.action === "unknown_section" || result.action === "section_closed" || result.action === "out_of_order") {
      return timed(started, { error: result.action, starts: result.starts, server_now_ms: result.nowMs }, 409);
    }
    if (result.action === "read" || result.action === "already" || result.action === "start") {
      return timed(started, {
        starts: result.starts,
        server_now_ms: result.nowMs,
        ...(result.memorizeList ? { memorize_list: result.memorizeList } : {}),
      });
    }
    return timed(started, { error: "timer_unavailable" }, 409);
  } catch (err) {
    if (err instanceof ZodError) return timed(started, { error: err.flatten().fieldErrors }, 400);
    logRouteError("section-timer", err);
    return timed(started, { error: "Internal server error" }, 500);
  }
}
