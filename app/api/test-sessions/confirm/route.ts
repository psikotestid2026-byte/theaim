import { NextRequest, NextResponse } from "next/server";
import { confirmIdentity, MAX_CONFIRM_ATTEMPTS } from "@/lib/queries/test-sessions";
import { invalidateTestAccess, cacheTestSession } from "@/lib/redis";
import { logRouteError } from "@/lib/log-error";
import { confirmBody } from "@/lib/validators/test-attempt";
import { ZodError } from "zod";

/** Neon is in ap-southeast-1. vercel.json sets the same default for every function. */
export const preferredRegion = "sin1";

function timed(started: number, body: unknown, status = 200) {
  const res = NextResponse.json(body, { status });
  res.headers.set("Server-Timing", `app;dur=${Math.max(0, Math.round(performance.now() - started))}`);
  return res;
}

// POST /api/test-sessions/confirm — one statement. Redis is not awaited.
export async function POST(req: NextRequest) {
  const started = performance.now();
  try {
    const body = await req.json();
    const { token, last4 } = confirmBody.parse(body);
    const row = await confirmIdentity(token, last4);

    if (!row.found || row.id == null) return timed(started, { error: "not_found" }, 404);
    if (row.status === "locked") return timed(started, { error: "locked" }, 423);
    if (row.status === "completed" && row.resultToken) {
      return timed(started, { redirect: `/hasil/${row.resultToken}` });
    }
    if (row.status === "expired" || row.status === "revoked") {
      return timed(started, { error: row.status }, 410);
    }
    if (row.status === "in_progress" || row.confirmed) {
      if (row.confirmed && row.testCode) {
        void cacheTestSession(token, { id: row.id, status: "in_progress", test_code: row.testCode }).catch((err) =>
          logRouteError("confirm cache", err),
        );
      }
      return timed(started, { ok: true, session_id: row.id, test_code: row.testCode });
    }
    if (!row.digitsOk) {
      if (row.lockedNow) {
        void invalidateTestAccess(token).catch((err) => logRouteError("confirm invalidate", err));
        return timed(started, { error: "locked", attempts: row.wrongAttempts ?? MAX_CONFIRM_ATTEMPTS }, 423);
      }
      const attempts = row.wrongAttempts ?? row.confirmAttempts;
      const remaining = Math.max(0, MAX_CONFIRM_ATTEMPTS - attempts);
      return timed(started, { error: "wrong_digit", remaining }, 422);
    }
    return timed(started, { error: "retry" }, 409);
  } catch (err) {
    if (err instanceof ZodError) return timed(started, { error: err.flatten().fieldErrors }, 400);
    logRouteError("confirm", err);
    return timed(started, { error: "Internal server error" }, 500);
  }
}
