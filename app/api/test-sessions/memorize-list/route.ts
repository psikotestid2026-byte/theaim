import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { istLastStartedIndex, istPhaseAt, istSubtestByCode } from "@/lib/ist-flow";
import { getIstMemorizeList, getIstSchedule } from "@/lib/queries/ist-content";
import { getSessionByAccessToken, readSectionTimers } from "@/lib/queries/test-sessions";
import { logRouteError } from "@/lib/log-error";
import { canWriteTest } from "@/lib/test-access";
import { positiveId } from "@/lib/validators/test-attempt";

const body = z.object({
  token: z.string().uuid(),
  session_id: positiveId,
});

function unavailable(): NextResponse {
  return NextResponse.json({ error: "not_available" }, { status: 404 });
}

/**
 * Returns the ME word list only while that subtest's server clock is still in the memorize phase.
 * Answer-phase, other subtests, and completed sessions get 404 with no list.
 */
export async function POST(req: NextRequest) {
  try {
    const { token, session_id } = body.parse(await req.json());
    const session = await getSessionByAccessToken(token);
    if (!session || session.id !== session_id || session.status === "completed" || !canWriteTest(session.status)) {
      return unavailable();
    }
    if (session.test_code.toLowerCase() !== "ist") return unavailable();

    const [schedule, timers] = await Promise.all([getIstSchedule(), readSectionTimers(session.id)]);
    const me = schedule ? istSubtestByCode(schedule, "ME") : null;
    const meIndex = schedule ? schedule.findIndex((row) => row.code === "ME") : -1;
    const started = me && timers ? timers.starts[me.code] : undefined;
    const inMemorize = Boolean(
      schedule &&
        me &&
        timers &&
        meIndex >= 0 &&
        typeof started === "number" &&
        istLastStartedIndex(schedule, timers.starts) === meIndex &&
        istPhaseAt(me, started, timers.nowMs).phase === "memorize",
    );
    if (!inMemorize) return unavailable();

    const list = await getIstMemorizeList();
    if (!list) return unavailable();
    return NextResponse.json({ list });
  } catch (err) {
    if (err instanceof ZodError) return unavailable();
    logRouteError("memorize-list", err);
    return unavailable();
  }
}
