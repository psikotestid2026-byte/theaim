import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { TestItem, TestItemOption } from "@/types/db";
import { computeResult } from "./index";

function likert(id: number, code: string): TestItem {
  const options: TestItemOption[] = [1, 2, 3, 4, 5].map((value) => ({
    value: String(value),
    label: String(value),
    score_key: "",
    score_val: value,
  }));
  return {
    id,
    test_code: code,
    section: null,
    item_order: id,
    question_text: `Soal ${id}`,
    options,
    scoring_meta: null,
    created_at: "",
    updated_at: "",
  };
}

describe("result copy", () => {
  it("names every tied MSAI quadrant instead of the first one", () => {
    const items = Array.from({ length: 87 }, (_, index) => likert(index + 1, "msai"));
    const responses: Record<number, string> = {};
    for (const row of items) responses[row.id] = "3";
    const scored = computeResult("msai", responses, items);
    assert.equal(scored.result_type, "Seri");
    assert.match(scored.result_label, /Adhocracy/);
    assert.match(scored.result_label, /Market/);
    assert.match(scored.result_label, /Hierarchy/);
    assert.match(scored.result_label, /Clan/);
    assert.match(scored.interpretation.description, /seri/i);
  });

  it("does not list a low MSDT orientation as a strength", () => {
    const items = [1, 2].map((id) => ({
      ...likert(id, "msdt"),
      options: [
        { value: "1", label: "Pernyataan A", score_key: "", score_val: 1 },
        { value: "2", label: "Pernyataan B", score_key: "", score_val: 2 },
      ],
    }));
    const scored = computeResult("msdt", { 1: "1", 2: "2" }, items);
    const strengths = scored.interpretation.strengths.join(" | ");
    assert.equal(strengths.includes("Rendah"), false);
    const orientation = scored.interpretation.detail as { orientationCategory?: { TO: string; RO: string; E: string } };
    assert.ok(orientation.orientationCategory);
    assert.equal(Object.values(orientation.orientationCategory).every((value) => value === "Tinggi" || value === "Rendah"), true);
  });
});