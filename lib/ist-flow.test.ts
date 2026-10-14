import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import type { IstScheduleEntry } from "./ist-types";
import { istAnswerWindowOpen, istCanStartSection, istFlowReachedEnd, istMemorizePhaseOpen, istPhaseAt, istSubtestByCode, pollUntil, shouldFetchMemorizeList, IST_SECTION_GRACE_MS } from "./ist-flow";

const T0 = 1_800_000_000_000;

const SCHEDULE: IstScheduleEntry[] = [
  { code: "SE", name: "Synthetic SE", from: 1, to: 2, timeLimitSec: 360 },
  { code: "WA", name: "Synthetic WA", from: 3, to: 4, timeLimitSec: 360 },
  { code: "AN", name: "Synthetic AN", from: 5, to: 6, timeLimitSec: 420 },
  { code: "GE", name: "Synthetic GE", from: 7, to: 8, timeLimitSec: 480 },
  { code: "RA", name: "Synthetic RA", from: 9, to: 10, timeLimitSec: 600 },
  { code: "ZR", name: "Synthetic ZR", from: 11, to: 12, timeLimitSec: 600 },
  { code: "FA", name: "Synthetic FA", from: 13, to: 14, timeLimitSec: 420 },
  { code: "WU", name: "Synthetic WU", from: 15, to: 16, timeLimitSec: 540 },
  { code: "ME", name: "Synthetic ME", from: 17, to: 18, timeLimitSec: 360, memorizeSec: 180 },
];

describe("IST subtest flow", () => {
  it("uses the supplied schedule, including a memorize phase on the last subtest", () => {
    assert.deepEqual(SCHEDULE.map((row) => row.code), ["SE", "WA", "AN", "GE", "RA", "ZR", "FA", "WU", "ME"]);
    assert.equal(istSubtestByCode(SCHEDULE, "ME")?.memorizeSec, 180);
    assert.equal(istSubtestByCode(SCHEDULE, "SE")?.timeLimitSec, 360);
  });

  it("starts subtests strictly in order and never reopens an earlier one", () => {
    assert.deepEqual(istCanStartSection(SCHEDULE, "SE", {}), { ok: true, alreadyStarted: false });
    assert.deepEqual(istCanStartSection(SCHEDULE, "WA", {}), { ok: false, reason: "out_of_order" });
    assert.deepEqual(istCanStartSection(SCHEDULE, "SE", { SE: T0 }), { ok: true, alreadyStarted: true });
    assert.deepEqual(istCanStartSection(SCHEDULE, "WA", { SE: T0, WA: T0 + 1 }), { ok: true, alreadyStarted: true });
    assert.deepEqual(istCanStartSection(SCHEDULE, "XX", {}), { ok: false, reason: "unknown_section" });
  });

  it("opens answers only during the answer phase (+grace) of the latest subtest", () => {
    const se = { SE: T0 };
    assert.equal(istAnswerWindowOpen(SCHEDULE, "SE", se, T0 + 1000), true);
    assert.equal(istAnswerWindowOpen(SCHEDULE, "SE", se, T0 + 360_000 + IST_SECTION_GRACE_MS), true);
    assert.equal(istAnswerWindowOpen(SCHEDULE, "SE", se, T0 + 360_000 + IST_SECTION_GRACE_MS + 1), false);
    assert.equal(istAnswerWindowOpen(SCHEDULE, "WA", se, T0 + 1000), false);
    assert.equal(istAnswerWindowOpen(SCHEDULE, "SE", { SE: T0, WA: T0 + 5000 }, T0 + 6000), false);
  });

  it("keeps a memorize phase before the answer phase when the schedule says so", () => {
    const me = istSubtestByCode(SCHEDULE, "ME")!;
    assert.equal(istPhaseAt(me, T0, T0 + 179_000).phase, "memorize");
    assert.equal(istPhaseAt(me, T0, T0 + 180_000).phase, "answer");
    assert.equal(istPhaseAt(me, T0, T0 + 540_000).phase, "over");
    const starts = Object.fromEntries(SCHEDULE.map((row, i) => [row.code, T0 + i]));
    assert.equal(istAnswerWindowOpen(SCHEDULE, "ME", starts, T0 + 100_000), false);
    assert.equal(istAnswerWindowOpen(SCHEDULE, "ME", starts, T0 + 200_000), true);
    assert.equal(istFlowReachedEnd(SCHEDULE, starts), true);
    assert.equal(istFlowReachedEnd(SCHEDULE, { SE: T0 }), false);
    assert.equal(istMemorizePhaseOpen(SCHEDULE, starts, T0 + 100_000), true);
    assert.equal(istMemorizePhaseOpen(SCHEDULE, starts, T0 + 200_000), false);
    assert.equal(istMemorizePhaseOpen(SCHEDULE, { SE: T0 }, T0), false);
  });

  it("re-reads a memorize clock that appears a moment after the section starts", async () => {
    const seen: number[] = [];
    let reads = 0;
    const value = await pollUntil(
      async () => {
        reads += 1;
        return reads >= 3 ? "open" : "missing";
      },
      (row) => row === "open",
      4,
      25,
      async (ms) => {
        seen.push(ms);
      },
    );
    assert.equal(value, "open");
    assert.deepEqual(seen, [25, 25]);
  });

  it("asks for the memorize list only on reload, after the clock is already visible", () => {
    assert.equal(shouldFetchMemorizeList(true, false, true), false);
    assert.equal(shouldFetchMemorizeList(false, false, true), false);
    assert.equal(shouldFetchMemorizeList(false, true, false), false);
    assert.equal(shouldFetchMemorizeList(false, true, true), true);
  });

  it("returns the memorize list from the same response that starts the section", () => {
    const src = readFileSync(new URL("../app/api/test-sessions/section-timer/route.ts", import.meta.url), "utf8");
    assert.match(src, /openIstSection/);
    assert.match(src, /memorize_list/);
    const query = readFileSync(new URL("./queries/test-sessions.ts", import.meta.url), "utf8");
    const open = query.slice(query.indexOf("export async function openIstSection"));
    assert.match(open, /memorizeList/);
    assert.match(open, /GREATEST/);
    assert.match(open, /status = 'in_progress'/);
    const runner = readFileSync(new URL("../components/test/IstRunner.tsx", import.meta.url), "utf8");
    assert.match(runner, /shouldFetchMemorizeList/);
    assert.equal(runner.includes("MEMORIZE_LIST_READ_ATTEMPTS"), false);
    const listRoute = readFileSync(new URL("../app/api/test-sessions/memorize-list/route.ts", import.meta.url), "utf8");
    assert.match(listRoute, /pollUntil/);
  });
});
