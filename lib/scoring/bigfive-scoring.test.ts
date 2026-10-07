import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { TestItem, TestItemOption } from "@/types/db";
import { computeResult } from "./index";
import { calculateBigFiveFromItems, resolveBigFiveKey } from "./ruangtes/bigfive";

describe("Big Five item keys", () => {
  it("maps the stored stems instead of BFI-44 positions", () => {
    const anxious = resolveBigFiveKey({ item_order: 1, question_text: "Saya mudah cemas" });
    assert.equal(anxious.dimension, "N");
    assert.equal(anxious.reversed, false);

    const outgoing = resolveBigFiveKey({ item_order: 2, question_text: "Saya ramah dan mudah bergaul" });
    assert.equal(outgoing.dimension, "E");
    assert.equal(outgoing.reversed, false);

    const calm = resolveBigFiveKey({ item_order: 6, question_text: "Saya tenang dalam menghadapi tekanan" });
    assert.equal(calm.dimension, "N");
    assert.equal(calm.reversed, true);

    const hardworking = resolveBigFiveKey({ item_order: 23, question_text: "Saya pekerja keras" });
    assert.equal(hardworking.dimension, "C");
    assert.equal(hardworking.reversed, false);
  });

  it("lets item metadata override the text key", () => {
    const key = resolveBigFiveKey({
      item_order: 1,
      question_text: "Saya mudah cemas",
      scoring_meta: { dimension: "O", reversed: true },
    });
    assert.equal(key.dimension, "O");
    assert.equal(key.reversed, true);
  });

  it("adds a high agreement on anxiety to Neuroticism, not Extraversion", () => {
    const scored = calculateBigFiveFromItems(
      [
        { id: 10, item_order: 1, question_text: "Saya mudah cemas" },
        { id: 11, item_order: 2, question_text: "Saya ramah dan mudah bergaul" },
        { id: 12, item_order: 6, question_text: "Saya tenang dalam menghadapi tekanan" },
      ],
      { 10: "5", 11: "5", 12: "5" },
    );
    assert.equal(scored.dimensions.N.raw, 6);
    assert.equal(scored.dimensions.E.raw, 5);
    assert.equal(scored.dimensions.A.raw, 0);
  });

  it("does not headline a dimension that has fewer than three bank items", () => {
    const likert: TestItemOption[] = [1, 2, 3, 4, 5].map((value) => ({
      value: String(value),
      label: String(value),
      score_key: "",
      score_val: value,
    }));
    const row = (id: number, text: string): TestItem => ({
      id,
      test_code: "bigfive",
      section: null,
      item_order: id,
      question_text: text,
      options: likert,
      scoring_meta: null,
      created_at: "",
      updated_at: "",
    });
    const scored = computeResult(
      "bigfive",
      { 1: "5", 2: "1", 3: "1", 4: "1" },
      [
        row(1, "Saya sangat sabar"),
        row(2, "Saya mudah cemas"),
        row(3, "Saya mudah marah"),
        row(4, "Saya sering khawatir"),
      ],
    );
    const dimensions = (scored.interpretation.detail as { dimensions: { code: string; name: string; itemCount: number }[] }).dimensions;
    assert.equal(dimensions.find((entry) => entry.code === "E")?.name, "Ekstraversi");
    assert.equal(JSON.stringify(scored).includes("Ekstraversion"), false);
    assert.equal(dimensions.find((entry) => entry.code === "A")?.itemCount, 1);
    assert.equal(dimensions.find((entry) => entry.code === "N")?.itemCount, 3);
    assert.equal(scored.result_label.includes("Agreeableness"), false);
    assert.match(scored.result_label, /Neuroticism/);
    assert.match(scored.interpretation.description, /Agreeableness punya 1 butir/);
    assert.match(scored.interpretation.description, /terlalu sedikit/);
    assert.equal(scored.interpretation.strengths.some((line) => line.includes("Agreeableness")), false);
  });
});
