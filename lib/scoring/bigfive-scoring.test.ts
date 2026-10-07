import assert from "node:assert/strict";
import { describe, it } from "node:test";
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
});
