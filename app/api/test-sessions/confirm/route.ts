import { NextRequest, NextResponse } from "next/server";
import {
  getSessionByAccessToken,
  incrementConfirmAttempts,
  lockSession,
  updateSessionStatus,
  MAX_CONFIRM_ATTEMPTS,
} from "@/lib/queries/test-sessions";
import { invalidateTestAccess, cacheTestSession } from "@/lib/redis";
import { getCustomerById } from "@/lib/queries/customers";
import { z } from "zod";

const schema = z.object({
  token: z.string().uuid(),
  last4: z.string().length(4),
});

// POST /api/test-sessions/confirm — identity confirmation (not OTP)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, last4 } = schema.parse(body);

    const session = await getSessionByAccessToken(token);
    if (!session) return NextResponse.json({ error: "not_found" }, { status: 404 });

    if (session.status === "locked") {
      return NextResponse.json({ error: "locked" }, { status: 423 });
    }
    if (session.status === "completed") {
      return NextResponse.json({ redirect: `/hasil/${session.result_token}` }, { status: 200 });
    }
    if (session.status === "expired" || session.status === "revoked") {
      return NextResponse.json({ error: session.status }, { status: 410 });
    }

    // Check 4-digit WA
    const customer = await getCustomerById(session.customer_id);
    const correctLast4 = customer?.whatsapp_number?.slice(-4);

    if (last4 !== correctLast4) {
      const newAttempts = session.confirm_attempts + 1;
      if (newAttempts >= MAX_CONFIRM_ATTEMPTS) {
        await lockSession(session.id);
        await invalidateTestAccess(token);
        return NextResponse.json({ error: "locked", attempts: newAttempts }, { status: 423 });
      }
      await incrementConfirmAttempts(session.id, newAttempts);
      const remaining = MAX_CONFIRM_ATTEMPTS - newAttempts;
      return NextResponse.json({ error: "wrong_digit", remaining }, { status: 422 });
    }

    // Correct — transition to in_progress
    await updateSessionStatus(session.id, "in_progress", { started_at: new Date() });
    await cacheTestSession(token, { ...session, status: "in_progress" });

    return NextResponse.json({ ok: true, session_id: session.id, test_code: session.test_code });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors }, { status: 400 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
