import { NextRequest, NextResponse } from "next/server";
import { getSessionByAccessToken, markTimerStarted, readAttemptTimer } from "@/lib/queries/test-sessions";
import { logRouteError } from "@/lib/log-error";
import { canWriteTest } from "@/lib/test-access";
import { completeBody } from "@/lib/validators/test-attempt";
import { ANSWER_GRACE_MS, isTimedTest, parseDbTimestamp, timedDurationSec } from "@/lib/test-timer";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, session_id } = completeBody.parse(body);
    const session = await getSessionByAccessToken(token);
    if (!session || session.id !== session_id) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (session.status === "completed") {
      return NextResponse.json({ error: "completed" }, { status: 409 });
    }
    if (!canWriteTest(session.status)) {
      return NextResponse.json({ error: "not_confirmed" }, { status: 403 });
    }
    const durationSec = timedDurationSec(session.test_code);
    if (!isTimedTest(session.test_code) || durationSec === null) {
      return NextResponse.json({ timed: false, duration_sec: 0 });
    }

    let timer = await readAttemptTimer(session.id);
    if (timer && !timer.timer_started_at) timer = await markTimerStarted(session.id);
    const startedMs = parseDbTimestamp(timer?.timer_started_at);
    const nowMs = parseDbTimestamp(timer?.server_now);
    if (!timer || startedMs === null || nowMs === null) {
      return NextResponse.json({ error: "timer_unavailable" }, { status: 409 });
    }

    return NextResponse.json({
      timed: true,
      timer_started_at: new Date(startedMs).toISOString(),
      server_now: new Date(nowMs).toISOString(),
      duration_sec: durationSec,
      grace_ms: ANSWER_GRACE_MS,
    });
  } catch (err) {
    if (err instanceof ZodError) return NextResponse.json({ error: err.flatten().fieldErrors }, { status: 400 });
    logRouteError("timer", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
