import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { encodeDiscAnswer } from "./scoring/disc-answer";
import { isAllowedAnswer } from "./test-answer";
import type { TestItem, TestItemOption } from "@/types/db";

function item(partial: Partial<TestItem> & Pick<TestItem, "options">): TestItem {
  return {
    id: 1,
    test_code: partial.test_code ?? "wpt",
    section: partial.section ?? null,
    item_order: partial.item_order ?? 1,
    question_text: "Soal",
    scoring_meta: null,
    created_at: "",
    updated_at: "",
    ...partial,
  };
}

const wpt = item({
  test_code: "wpt",
  options: ["Januari", "Maret", "Juni", "September", "Oktober"].map((label, index) => ({
    value: String(index + 1),
    label,
    score_key: "",
    score_val: index + 1,
  })) as TestItemOption[],
});

const disc = item({
  test_code: "disc",
  section: "disc",
  options: ["A", "B", "C", "D"].map((label, index) => ({
    value: String(index),
    label,
    score_key: "",
    score_val: 0,
  })),
});

describe("answer validation", () => {
  it("accepts only a stored option value", () => {
    assert.equal(isAllowedAnswer("wpt", wpt, "1"), true);
    assert.equal(isAllowedAnswer("wpt", wpt, "Januari"), false);
    assert.equal(isAllowedAnswer("wpt", wpt, "9"), false);
  });

  it("accepts a complete DISC pair inside the option list", () => {
    assert.equal(isAllowedAnswer("disc", disc, encodeDiscAnswer({ P: 0, K: 1 })), true);
    assert.equal(isAllowedAnswer("disc", disc, encodeDiscAnswer({ P: 0, K: 6 })), false);
    assert.equal(isAllowedAnswer("disc", disc, "1"), false);
  });
});
