import { NextRequest, NextResponse } from "next/server";
import { getSessionByAccessToken, markSessionCompleted, readAttemptTimer } from "@/lib/queries/test-sessions";
import { getResponsesBySession } from "@/lib/queries/test-responses";
import { getItemsByTestCode } from "@/lib/queries/test-items";
import { insertTestResultOnce } from "@/lib/queries/test-results";
import { insertTmResultOnce } from "@/lib/queries/tm-results";
import { computeResult } from "@/lib/scoring";
import { invalidateTestAccess, cacheTestResult } from "@/lib/redis";
import { asId } from "@/lib/ids";
import { logRouteError } from "@/lib/log-error";
import { canWriteTest } from "@/lib/test-access";
import { completeBody } from "@/lib/validators/test-attempt";
import { appendResultLink, resultPageUrl, siteOrigin } from "@/lib/site-url";
import { isAttemptExpired, isTimedTest, parseDbTimestamp, timedDurationSec } from "@/lib/test-timer";
import { unansweredCount } from "@/lib/test-completion";
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
      return NextResponse.json({ result_token: session.result_token });
    }
    if (session.status === "locked") {
      return NextResponse.json({ error: "locked" }, { status: 423 });
    }
    if (!canWriteTest(session.status)) {
      return NextResponse.json({ error: "not_confirmed" }, { status: 403 });
    }

    const [items, responses] = await Promise.all([
      getItemsByTestCode(session.test_code),
      getResponsesBySession(session_id),
    ]);

    const responsesMap: Record<number, string> = {};
    for (const row of responses) responsesMap[asId(row.item_id)] = row.answer_value;

    const durationSec = timedDurationSec(session.test_code);
    let expired = false;
    if (durationSec !== null && isTimedTest(session.test_code)) {
      const timer = await readAttemptTimer(session.id);
      const startedMs = parseDbTimestamp(timer?.timer_started_at);
      const nowMs = parseDbTimestamp(timer?.server_now);
      expired = startedMs !== null && nowMs !== null && isAttemptExpired(startedMs, durationSec, nowMs);
    }
    if (!expired) {
      const missing = unansweredCount(session.test_code, items, responsesMap);
      if (missing > 0) {
        return NextResponse.json({ error: "incomplete", missing }, { status: 422 });
      }
    }

    const payload = computeResult(session.test_code, responsesMap, items);
    const origin = siteOrigin({
      forwardedHost: req.headers.get("x-forwarded-host"),
      host: req.headers.get("host"),
      forwardedProto: req.headers.get("x-forwarded-proto"),
    });
    payload.wa_summary_text = appendResultLink(payload.wa_summary_text, resultPageUrl(session.result_token, origin));
    const result = await insertTestResultOnce(session_id, session.test_code, payload);

    if (session.test_code === "talents_mapping" && payload.tm) {
      await insertTmResultOnce({
        test_result_id: asId(result.id),
        session_id,
        customer_id: session.customer_id,
        tm: payload.tm,
      });
    }

    const completed = await markSessionCompleted(session_id);
    if (!completed) {
      const latest = await getSessionByAccessToken(token);
      if (latest?.status === "completed") {
        return NextResponse.json({ result_token: session.result_token });
      }
      return NextResponse.json({ error: latest?.status ?? "not_completed" }, { status: 409 });
    }

    await invalidateTestAccess(token).catch((cacheErr) => logRouteError("complete invalidate", cacheErr));
    await cacheTestResult(session.result_token, result).catch((cacheErr) => logRouteError("complete cache", cacheErr));

    return NextResponse.json({ result_token: session.result_token });
  } catch (err) {
    if (err instanceof ZodError) return NextResponse.json({ error: err.flatten().fieldErrors }, { status: 400 });
    logRouteError("complete", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
