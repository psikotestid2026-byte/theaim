import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { TestItem } from "@/types/db";
import { TALENT_THEME_SEEDS } from "@/db/seed-data/talent-catalog";
import { encodeDiscAnswer } from "./disc-answer";
import { computeResult } from "./index";

function item(partial: Pick<TestItem, "id" | "item_order" | "options"> & Partial<TestItem>): TestItem {
  return {
    test_code: partial.test_code ?? "demo",
    section: partial.section ?? null,
    question_text: partial.question_text ?? "Pertanyaan",
    scoring_meta: partial.scoring_meta ?? null,
    created_at: "",
    updated_at: "",
    ...partial,
  };
}

describe("talents mapping rank bands", () => {
  it("ranks 34 themes into the five published bands", () => {
    const items = TALENT_THEME_SEEDS.map((theme, index) =>
      item({
        id: index + 1,
        item_order: index + 1,
        test_code: "talents_mapping",
        options: [{ value: "5", label: "Sangat sesuai", score_key: theme.code, score_val: 5 }],
        scoring_meta: {
          theme_code: theme.code,
          theme_name: theme.name,
          domain: theme.domain,
          polarity: "positive",
        },
      }),
    );
    const responses: Record<number, string> = {};
    for (const row of items) responses[row.id] = row.id === 1 ? "5" : "1";

    const scored = computeResult("talents_mapping", responses, items);
    assert.equal(scored.tm?.talent_ranking.length, 34);
    assert.equal(scored.tm?.talent_ranking[0].code, "ACH");
    assert.equal(scored.tm?.talent_ranking[0].level, "dominant");
    assert.equal(scored.tm?.talent_ranking[0].color, "red");
    assert.equal(scored.tm?.talent_ranking[6].level, "dominant");
    assert.equal(scored.tm?.talent_ranking[7].level, "supporting");
    assert.equal(scored.tm?.talent_ranking[7].color, "yellow");
    assert.equal(scored.tm?.talent_ranking[14].level, "neutral");
    assert.equal(scored.tm?.talent_ranking[20].level, "weak");
    assert.equal(scored.tm?.talent_ranking[27].level, "very_weak");
    assert.equal(scored.tm?.talent_ranking[33].level, "very_weak");
    assert.equal(scored.tm?.talent_ranking[33].color, "black");

    const domains = scored.tm?.domain_distribution ?? {};
    const counts = Object.values(domains).reduce((sum, bucket) => sum + bucket.count, 0);
    const dominant = Object.values(domains).reduce((sum, bucket) => sum + bucket.dominant_count, 0);
    assert.equal(counts, 34);
    assert.equal(dominant, 7);
    assert.ok((domains.Striving?.dominant_count ?? 0) >= 1);
  });

  it("reverses a negative stem", () => {
    const theme = TALENT_THEME_SEEDS[0];
    const scored = computeResult(
      "talents_mapping",
      { 1: "5" },
      [
        item({
          id: 1,
          item_order: 1,
          options: [{ value: "5", label: "Sangat sesuai", score_key: theme.code, score_val: 5 }],
          scoring_meta: { theme_code: theme.code, polarity: "negative" },
        }),
      ],
    );
    assert.equal(scored.raw_scores[theme.code], 1);
  });
});

describe("retail scorers", () => {
  it("keeps the uppercase MBTI score_key scorer", () => {
    const scored = computeResult(
      "MBTI",
      { 1: "A" },
      [
        item({
          id: 1,
          item_order: 1,
          test_code: "MBTI",
          options: [
            { value: "A", label: "Orang", score_key: "E", score_val: 1 },
            { value: "B", label: "Sendiri", score_key: "I", score_val: 1 },
          ],
        }),
      ],
    );
    assert.equal(scored.result_type[0], "E");
    assert.equal("tm" in scored, false);
  });

  it("scores lowercase mbti by pole position", () => {
    const scored = computeResult(
      "mbti",
      { 1: "1" },
      [item({ id: 1, item_order: 1, test_code: "mbti", options: [{ value: "1", label: "A", score_key: "", score_val: 1 }] })],
    );
    assert.equal(scored.result_type, "ENFP");
    assert.equal(scored.raw_scores.E, 1);
  });

  it("scores DISC most and least from P/K indexes", () => {
    const scored = computeResult(
      "disc",
      { 1: encodeDiscAnswer({ P: 0, K: 1 }) },
      [
        item({
          id: 1,
          item_order: 1,
          test_code: "disc",
          options: [0, 1, 2, 3].map((index) => ({
            value: String(index + 1),
            label: `Pilihan ${index}`,
            score_key: "",
            score_val: 1,
          })),
        }),
      ],
    );
    assert.equal(scored.interpretation.detail && (scored.interpretation.detail.most as { S: number }).S, 1);
    assert.equal(scored.interpretation.detail && (scored.interpretation.detail.least as { I: number }).I, 1);
  });

  it("scores Big Five from the stored wording, not BFI-44 positions", () => {
    const likert = [1, 2, 3, 4, 5].map((value) => ({
      value: String(value),
      label: String(value),
      score_key: "",
      score_val: value,
    }));
    const scored = computeResult(
      "bigfive",
      { 1: "5", 2: "5" },
      [
        item({ id: 1, item_order: 9, question_text: "Saya mudah cemas", options: likert }),
        item({ id: 2, item_order: 1, question_text: "Saya ramah dan mudah bergaul", options: likert }),
      ],
    );
    assert.equal(scored.raw_scores.N, 5);
    assert.equal(scored.raw_scores.E, 5);
    assert.equal(scored.raw_scores.A, 0);
  });

  it("counts a RIASEC like toward the published type", () => {
    const scored = computeResult(
      "riasec",
      { 1: "1" },
      [
        item({
          id: 1,
          item_order: 1,
          options: [
            { value: "1", label: "Suka", score_key: "", score_val: 1 },
            { value: "2", label: "Tidak Suka", score_key: "", score_val: 0 },
          ],
        }),
      ],
    );
    assert.equal(scored.raw_scores.A, 1);
    assert.equal(String(scored.result_type).startsWith("A"), true);
  });

  it("adds an Enneagram Likert point to the keyed type", () => {
    const scored = computeResult(
      "enneagram",
      { 1: "5" },
      [
        item({
          id: 1,
          item_order: 1,
          options: [{ value: "5", label: "Sangat Sesuai", score_key: "", score_val: 5 }],
        }),
      ],
    );
    assert.equal(scored.raw_scores["Tipe 3"], 5);
    assert.equal(scored.result_type.startsWith("Tipe 3") || scored.result_type.startsWith("3w"), true);
  });

  it("rejects an unknown code", () => {
    assert.throws(() => computeResult("IQ", {}, []), /No scoring function/);
  });
});
