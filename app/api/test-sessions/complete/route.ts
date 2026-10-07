import { NextRequest, NextResponse } from "next/server";
import { getSessionByAccessToken, markSessionCompleted } from "@/lib/queries/test-sessions";
import { getResponsesBySession } from "@/lib/queries/test-responses";
import { getItemsByTestCode } from "@/lib/queries/test-items";
import { insertTestResultOnce } from "@/lib/queries/test-results";
import { insertTmResultOnce } from "@/lib/queries/tm-results";
import { computeResult } from "@/lib/scoring";
import { invalidateTestAccess, cacheTestResult } from "@/lib/redis";
import { z } from "zod";

const schema = z.object({ token: z.string().uuid(), session_id: z.number().int().positive() });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, session_id } = schema.parse(body);

    const session = await getSessionByAccessToken(token);
    if (!session || session.id !== session_id) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (session.status === "completed") {
      return NextResponse.json({ result_token: session.result_token });
    }
    if (session.status === "locked" || session.status === "revoked" || session.status === "expired") {
      return NextResponse.json({ error: session.status }, { status: session.status === "locked" ? 423 : 403 });
    }

    const [items, responses] = await Promise.all([
      getItemsByTestCode(session.test_code),
      getResponsesBySession(session_id),
    ]);

    const responsesMap: Record<number, string> = {};
    for (const row of responses) responsesMap[row.item_id] = row.answer_value;

    const payload = computeResult(session.test_code, responsesMap, items);
    const result = await insertTestResultOnce(session_id, session.test_code, payload);

    if (session.test_code === "talents_mapping" && payload.tm) {
      await insertTmResultOnce({
        test_result_id: result.id,
        session_id,
        customer_id: session.customer_id,
        tm: payload.tm,
      });
    }

    const completed = await markSessionCompleted(session_id);
    if (!completed && session.status !== "completed") {
      const latest = await getSessionByAccessToken(token);
      if (latest?.status === "completed") {
        return NextResponse.json({ result_token: session.result_token });
      }
      return NextResponse.json({ error: latest?.status ?? "not_completed" }, { status: 409 });
    }

    await invalidateTestAccess(token);
    await cacheTestResult(session.result_token, result);

    return NextResponse.json({ result_token: session.result_token });
  } catch (err) {
    console.error("complete error:", err instanceof Error ? err.name : "unknown");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
