import { NextRequest, NextResponse } from "next/server";
import { saveAnswerOnce } from "@/lib/queries/test-responses";
import { bufferAnswer } from "@/lib/redis";
import { logRouteError } from "@/lib/log-error";
import { testResponseBody } from "@/lib/validators/test-attempt";
import { ZodError } from "zod";

/** Neon is in ap-southeast-1. vercel.json sets the same default for every function. */
export const preferredRegion = "sin1";

function timed(started: number, body: unknown, status = 200) {
  const res = NextResponse.json(body, { status });
  res.headers.set("Server-Timing", `app;dur=${Math.max(0, Math.round(performance.now() - started))}`);
  return res;
}

// POST /api/test-responses — one statement. Redis is best-effort and not awaited.
export async function POST(req: NextRequest) {
  const started = performance.now();
  try {
    const body = await req.json();
    const data = testResponseBody.parse(body);
    const reason = await saveAnswerOnce({
      token: data.token,
      sessionId: data.session_id,
      itemId: data.item_id,
      answerValue: data.answer_value,
    });
    if (reason === "not_found") return timed(started, { error: "not_found" }, 404);
    if (reason === "not_confirmed") return timed(started, { error: "not_confirmed" }, 403);
    if (reason === "invalid_answer") return timed(started, { error: "invalid_answer" }, 400);
    if (reason === "section_closed") return timed(started, { error: "section_closed" }, 409);
    if (reason === "expired") return timed(started, { error: "expired" }, 409);
    void bufferAnswer(data.session_id, data.item_id, data.answer_value).catch((err) => logRouteError("response cache", err));
    return timed(started, { ok: true });
  } catch (err) {
    if (err instanceof ZodError) return timed(started, { error: err.flatten().fieldErrors }, 400);
    logRouteError("test-responses", err);
    return timed(started, { error: "Internal server error" }, 500);
  }
}
