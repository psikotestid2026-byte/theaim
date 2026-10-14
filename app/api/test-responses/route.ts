import { NextRequest, NextResponse } from "next/server";
import { loadAnswerWriteContext, upsertResponse } from "@/lib/queries/test-responses";
import { markTimerStarted } from "@/lib/queries/test-sessions";
import { istAnswerWindowOpen } from "@/lib/ist-flow";
import { getIstSchedule } from "@/lib/queries/ist-content";
import { istSubtestOf } from "@/lib/scoring/ist";
import { bufferAnswer } from "@/lib/redis";
import { logRouteError } from "@/lib/log-error";
import { isAllowedAnswer } from "@/lib/test-answer";
import { canWriteTest } from "@/lib/test-access";
import { testResponseBody } from "@/lib/validators/test-attempt";
import { answersStillAccepted, isTimedTest, parseDbTimestamp, timedDurationSec } from "@/lib/test-timer";
import { ZodError } from "zod";

// POST /api/test-responses — one joined read, one upsert. Redis is best-effort and not awaited.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = testResponseBody.parse(body);
    let scheduleError: unknown = null;
    const schedulePromise = getIstSchedule().catch((err) => {
      scheduleError = err;
      return null;
    });

    const ctx = await loadAnswerWriteContext(data.token, data.session_id, data.item_id);
    if (!ctx || ctx.sessionId !== data.session_id) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (!canWriteTest(ctx.status)) {
      return NextResponse.json({ error: "not_confirmed" }, { status: 403 });
    }
    if (!ctx.item || !isAllowedAnswer(ctx.testCode, ctx.item, data.answer_value)) {
      return NextResponse.json({ error: "invalid_answer" }, { status: 400 });
    }

    if (ctx.testCode.toLowerCase() === "ist") {
      const code = istSubtestOf(ctx.item);
      const schedule = await schedulePromise;
      if (scheduleError) throw scheduleError;
      if (!code || !schedule || !Number.isFinite(ctx.nowMs) || !istAnswerWindowOpen(schedule, code, ctx.starts, ctx.nowMs)) {
        return NextResponse.json({ error: "section_closed" }, { status: 409 });
      }
    }

    if (isTimedTest(ctx.testCode)) {
      const durationSec = timedDurationSec(ctx.testCode);
      let startedMs = parseDbTimestamp(ctx.timerStartedAt);
      let nowMs = Number.isFinite(ctx.nowMs) ? ctx.nowMs : parseDbTimestamp(ctx.serverNow);
      if (!ctx.timerStartedAt) {
        const timer = await markTimerStarted(ctx.sessionId);
        startedMs = parseDbTimestamp(timer?.timer_started_at);
        nowMs = parseDbTimestamp(timer?.server_now);
      }
      if (durationSec === null || startedMs === null || nowMs === null || !answersStillAccepted(startedMs, durationSec, nowMs)) {
        return NextResponse.json({ error: "expired" }, { status: 409 });
      }
    }

    await upsertResponse(data);
    // The row above is the answer. Do not make the client wait on the buffer.
    void bufferAnswer(data.session_id, data.item_id, data.answer_value).catch((err) => logRouteError("response cache", err));

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ZodError) return NextResponse.json({ error: err.flatten().fieldErrors }, { status: 400 });
    logRouteError("test-responses", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
