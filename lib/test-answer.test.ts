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
  options: ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D", "Pilihan E"].map((label, index) => ({
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
    assert.equal(isAllowedAnswer("wpt", wpt, "Pilihan A"), false);
    assert.equal(isAllowedAnswer("wpt", wpt, "9"), false);
  });

  it("accepts typed answers for isian items, digits only for number items", () => {
    const isian = item({ test_code: "wpt", options: [], scoring_meta: { answer_type: "text", match: "number" } });
    assert.equal(isAllowedAnswer("wpt", isian, "1,5"), true);
    assert.equal(isAllowedAnswer("wpt", isian, "   "), false);
    assert.equal(isAllowedAnswer("wpt", isian, "x".repeat(81)), false);
    const ra = item({ test_code: "ist", options: [], scoring_meta: { subtest: "RA", answer_type: "number" } });
    assert.equal(isAllowedAnswer("ist", ra, "246"), true);
    assert.equal(isAllowedAnswer("ist", ra, "2,4"), false);
  });

  it("accepts a complete DISC pair inside the option list", () => {
    assert.equal(isAllowedAnswer("disc", disc, encodeDiscAnswer({ P: 0, K: 1 })), true);
    assert.equal(isAllowedAnswer("disc", disc, encodeDiscAnswer({ P: 0, K: 6 })), false);
    assert.equal(isAllowedAnswer("disc", disc, "1"), false);
  });
});
