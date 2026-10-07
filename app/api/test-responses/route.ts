import { NextRequest, NextResponse } from "next/server";
import { getItemForTest } from "@/lib/queries/test-items";
import { upsertResponse } from "@/lib/queries/test-responses";
import { getSessionByAccessToken, markTimerStarted, readAttemptTimer } from "@/lib/queries/test-sessions";
import { bufferAnswer } from "@/lib/redis";
import { logRouteError } from "@/lib/log-error";
import { isAllowedAnswer } from "@/lib/test-answer";
import { canWriteTest } from "@/lib/test-access";
import { testResponseBody } from "@/lib/validators/test-attempt";
import { answersStillAccepted, isTimedTest, parseDbTimestamp, timedDurationSec } from "@/lib/test-timer";
import { ZodError } from "zod";

// POST /api/test-responses — one item check, one upsert, one Redis HSET
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = testResponseBody.parse(body);

    const session = await getSessionByAccessToken(data.token);
    if (!session || session.id !== data.session_id) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (!canWriteTest(session.status)) {
      return NextResponse.json({ error: "not_confirmed" }, { status: 403 });
    }

    const item = await getItemForTest(data.item_id, session.test_code);
    if (!item || !isAllowedAnswer(session.test_code, item, data.answer_value)) {
      return NextResponse.json({ error: "invalid_answer" }, { status: 400 });
    }

    if (isTimedTest(session.test_code)) {
      const durationSec = timedDurationSec(session.test_code);
      let timer = durationSec === null ? null : await readAttemptTimer(session.id);
      if (timer && !timer.timer_started_at) timer = await markTimerStarted(session.id);
      const startedMs = parseDbTimestamp(timer?.timer_started_at);
      const nowMs = parseDbTimestamp(timer?.server_now);
      if (durationSec === null || !timer || startedMs === null || nowMs === null || !answersStillAccepted(startedMs, durationSec, nowMs)) {
        return NextResponse.json({ error: "expired" }, { status: 409 });
      }
    }

    await upsertResponse(data);
    await bufferAnswer(data.session_id, data.item_id, data.answer_value).catch((err) =>
      logRouteError("response cache", err),
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ZodError) return NextResponse.json({ error: err.flatten().fieldErrors }, { status: 400 });
    logRouteError("test-responses", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
