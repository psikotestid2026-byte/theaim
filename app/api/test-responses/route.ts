import { NextRequest, NextResponse } from "next/server";
import { upsertResponse } from "@/lib/queries/test-responses";
import { bufferAnswer } from "@/lib/redis";
import { z } from "zod";

const schema = z.object({
  session_id: z.number().int().positive(),
  item_id: z.number().int().positive(),
  answer_value: z.string().min(1),
});

// POST /api/test-responses — hottest write path (one upsert + one Redis HSET)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    // DB upsert
    await upsertResponse(data);

    // Redis buffer (48h TTL)
    await bufferAnswer(data.session_id, data.item_id, data.answer_value).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.flatten().fieldErrors }, { status: 400 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
