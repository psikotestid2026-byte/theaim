import { NextRequest, NextResponse } from "next/server";
import { upsertResponse } from "@/lib/queries/test-responses";
import { getSessionByAccessToken } from "@/lib/queries/test-sessions";
import { bufferAnswer } from "@/lib/redis";
import { logRouteError } from "@/lib/log-error";
import { canWriteTest } from "@/lib/test-access";
import { testResponseBody } from "@/lib/validators/test-attempt";
import { ZodError } from "zod";

// POST /api/test-responses — hottest write path (one upsert + one Redis HSET)
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
