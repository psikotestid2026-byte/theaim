import { NextRequest, NextResponse } from "next/server";
import { getSessionByAccessToken, updateSessionStatus } from "@/lib/queries/test-sessions";
import { getResponsesBySession } from "@/lib/queries/test-responses";
import { getItemsByTestCode } from "@/lib/queries/test-items";
import { createTestResult } from "@/lib/queries/test-results";
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

    // Load items and responses
    const [items, responses] = await Promise.all([
      getItemsByTestCode(session.test_code),
      getResponsesBySession(session_id),
    ]);

    const responsesMap: Record<number, string> = {};
    for (const r of responses) responsesMap[r.item_id] = r.answer_value;

    // Score
    const payload = computeResult(session.test_code, responsesMap, items);

    // Save result
    const result = await createTestResult(session_id, session.test_code, payload);

    // Mark completed (one-way, never reset)
    await updateSessionStatus(session_id, "completed", { completed_at: new Date() });

    // Invalidate access token, cache result
    await invalidateTestAccess(token);
    await cacheTestResult(session.result_token, result);

    return NextResponse.json({ result_token: session.result_token });
  } catch (err) {
    console.error("complete error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
