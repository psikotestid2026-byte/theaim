import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeResult } from "./index";
import { calculateWptFromItems, parseWptNumber, wptAnswerIsCorrect, WPT_RS_TO_IQ } from "./ruangtes/wpt";

function choiceItem(id: number) {
  return { id, item_order: id, scoring_meta: { match: "choice" as const, accepted: ["1"] } };
}

describe("WPT answer matching", () => {
  it("parses Indonesian numbers", () => {
    assert.equal(parseWptNumber("1,75"), 1.75);
    assert.equal(parseWptNumber("1.75"), 1.75);
    assert.equal(parseWptNumber("6.000"), 6000);
    assert.equal(parseWptNumber("Rp 1.250"), 1250);
    assert.equal(parseWptNumber("3/8"), 0.375);
    assert.equal(parseWptNumber("½"), 0.5);
    assert.equal(parseWptNumber(".33"), 0.33);
    assert.equal(parseWptNumber("abc"), null);
  });

  it("matches a synthetic number key with comma or dot", () => {
    const meta = { match: "number" as const, accepted: ["1.75"] };
    assert.equal(wptAnswerIsCorrect(meta, "1,75"), true);
    assert.equal(wptAnswerIsCorrect(meta, "1.75 unit"), true);
    assert.equal(wptAnswerIsCorrect(meta, "1,74"), false);
  });

  it("matches several synthetic spellings, fractions, pairs, and choices", () => {
    const several = { match: "number" as const, accepted: ["8", "1.5"] };
    for (const answer of ["8", "1.5", "1,5"]) assert.equal(wptAnswerIsCorrect(several, answer), true, answer);
    assert.equal(wptAnswerIsCorrect(several, "15"), false);

    assert.equal(wptAnswerIsCorrect({ match: "number", accepted: ["1/3"] }, "0,333"), true);
    assert.equal(wptAnswerIsCorrect({ match: "number", accepted: ["1/3"] }, "0,33"), false);
    assert.equal(wptAnswerIsCorrect({ match: "numbers_set", accepted: ["2", "9"] }, "2 dan 9"), true);
    assert.equal(wptAnswerIsCorrect({ match: "numbers_set", accepted: ["2", "9"] }, "9,2"), true);
    assert.equal(wptAnswerIsCorrect({ match: "numbers_set", accepted: ["2", "9"] }, "2 dan 8"), false);
    assert.equal(wptAnswerIsCorrect({ match: "numbers_set", accepted: ["7", "8", "9"] }, "7-8-9"), true);
    assert.equal(wptAnswerIsCorrect({ match: "numbers_set", accepted: ["7", "8", "9"] }, "7-8"), false);
    assert.equal(wptAnswerIsCorrect({ match: "choice", accepted: ["1"] }, "1"), true);
    assert.equal(wptAnswerIsCorrect({ match: "choice", accepted: ["1"] }, "satu"), false);
    assert.equal(wptAnswerIsCorrect({ match: "text", accepted: ["ya"] }, "Ya"), true);
  });
});

describe("WPT result (synthetic items)", () => {
  const items = Array.from({ length: 50 }, (_, index) => choiceItem(index + 1));

  it("20 correct → IQ 100 (Dodrill 1981)", () => {
    const responses: Record<number, string> = {};
    for (const item of items.slice(0, 20)) responses[item.id] = "1";
    const scored = calculateWptFromItems(items, responses);
    assert.equal(scored.raw_score, 20);
    assert.equal(scored.iq, 100);
    assert.equal(scored.extrapolated, false);
  });

  it("all correct → 50, IQ 146 marked as extrapolated", () => {
    const responses: Record<number, string> = {};
    for (const item of items) responses[item.id] = "1";
    const result = computeResult("wpt", responses, items.map((item) => ({
      id: item.id,
      test_code: "wpt",
      section: "wpt",
      item_order: item.item_order,
      question_text: "synthetic",
      options: [],
      scoring_meta: item.scoring_meta,
      created_at: "",
      updated_at: "",
    })));
    assert.equal(result.raw_scores.benar, 50);
    assert.equal(result.raw_scores.iq, 146);
    assert.equal((result.interpretation.detail as { extrapolated: boolean }).extrapolated, true);
    assert.equal(WPT_RS_TO_IQ[44], 146);
    assert.equal(WPT_RS_TO_IQ[35], 128);
  });
});
