import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { getSessionByAccessToken, readSectionTimers, startSectionTimer } from "@/lib/queries/test-sessions";
import { logRouteError } from "@/lib/log-error";
import { canWriteTest } from "@/lib/test-access";
import { positiveId } from "@/lib/validators/test-attempt";
import { istCanStartSection, istMemorizePhaseOpen } from "@/lib/ist-flow";
import { getIstMemorizeList, getIstSchedule } from "@/lib/queries/ist-content";

const body = z.object({
  token: z.string().uuid(),
  session_id: positiveId,
  section: z.string().trim().min(2).max(4).optional(),
});

// POST /api/test-sessions/section-timer — read or start one IST subtest clock (server time).
export async function POST(req: NextRequest) {
  try {
    const { token, session_id, section } = body.parse(await req.json());
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
    if (session.test_code.toLowerCase() !== "ist") {
      return NextResponse.json({ error: "not_sectioned" }, { status: 400 });
    }

    let timers = await readSectionTimers(session.id);
    if (!timers) return NextResponse.json({ error: "timer_unavailable" }, { status: 409 });

    const schedule = session.test_code.toLowerCase() === "ist" ? await getIstSchedule() : null;
    if (section) {
      if (!schedule) return NextResponse.json({ error: "config_unavailable" }, { status: 409 });
      const check = istCanStartSection(schedule, section, timers.starts);
      if (!check.ok) return NextResponse.json({ error: check.reason, starts: timers.starts, server_now_ms: timers.nowMs }, { status: 409 });
      if (!check.alreadyStarted) {
        timers = await startSectionTimer(session.id, section.toUpperCase());
        if (!timers) return NextResponse.json({ error: "timer_unavailable" }, { status: 409 });
      }
    }

    // Same response as the clock start, so the runner does not race a second request.
    const memorizeList =
      schedule && timers && istMemorizePhaseOpen(schedule, timers.starts, timers.nowMs) ? await getIstMemorizeList() : null;

    return NextResponse.json({
      starts: timers.starts,
      server_now_ms: timers.nowMs,
      ...(memorizeList ? { memorize_list: memorizeList } : {}),
    });
  } catch (err) {
    if (err instanceof ZodError) return NextResponse.json({ error: err.flatten().fieldErrors }, { status: 400 });
    logRouteError("section-timer", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
