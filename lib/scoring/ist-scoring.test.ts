import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { TestItem, TestItemOption } from "@/types/db";
import { computeResult } from "./index";
import { istAnswerMatchesKey } from "./retail";

function item(order: number, options: TestItemOption[]): TestItem {
  return {
    id: order,
    test_code: "ist",
    section: "multiple_choice",
    item_order: order,
    question_text: `Soal ${order}`,
    options,
    scoring_meta: null,
    created_at: "",
    updated_at: "",
  };
}

function choices(labels: string[]): TestItemOption[] {
  return labels.map((label, index) => ({
    value: String(index + 1),
    label,
    score_key: "",
    score_val: index + 1,
  }));
}

const q94 = item(94, choices(["10", "4", "6", "5", "3"]));
const q96 = item(96, choices(["13", "5", "1", "3", "8"]));

describe("IST key matching", () => {
  it("scores the option label and ignores a value that happens to equal the key", () => {
    assert.equal(istAnswerMatchesKey(q94, "5", "5"), false);
    assert.equal(istAnswerMatchesKey(q94, "4", "5"), true);
    assert.equal(istAnswerMatchesKey(q96, "3", "3"), false);
    assert.equal(istAnswerMatchesKey(q96, "4", "3"), true);
    assert.equal(istAnswerMatchesKey(q94, "5", "5"), false);

    const wrong = computeResult("ist", { 94: "5", 96: "3" }, [q94, q96]);
    assert.equal(wrong.raw_scores.RA, 0);

    const right = computeResult("ist", { 94: "4", 96: "4" }, [q94, q96]);
    assert.equal(right.raw_scores.RA, 2);
  });
});
