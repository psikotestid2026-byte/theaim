import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("function region", () => {
  it("pins serverless functions to Singapore, next to Neon", () => {
    const vercel = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8")) as { regions?: string[] };
    assert.deepEqual(vercel.regions, ["sin1"]);
    const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
    assert.match(layout, /preferredRegion = "sin1"/);
    for (const path of [
      "../app/api/test-responses/route.ts",
      "../app/api/test-sessions/confirm/route.ts",
      "../app/api/test-sessions/section-timer/route.ts",
    ]) {
      const src = readFileSync(new URL(path, import.meta.url), "utf8");
      assert.match(src, /preferredRegion = "sin1"/);
      assert.match(src, /Server-Timing/);
    }
  });

  it("does not move a completed session on confirm or save", () => {
    const sessions = readFileSync(new URL("./queries/test-sessions.ts", import.meta.url), "utf8");
    const confirm = sessions.slice(sessions.indexOf("export async function confirmIdentity"));
    assert.match(confirm, /status IN \('issued', 'confirming'\)/);
    const open = sessions.slice(sessions.indexOf("export async function openIstSection"));
    assert.match(open, /status = 'in_progress'/);
    const responses = readFileSync(new URL("./queries/test-responses.ts", import.meta.url), "utf8");
    const save = responses.slice(responses.indexOf("export async function saveAnswerOnce"));
    assert.match(save, /status = 'in_progress'/);
    assert.match(save, /AND \(SELECT reason FROM gate\) = 'ok'/);
  });
});
