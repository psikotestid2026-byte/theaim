import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { presentTakerItems, presentTakerResult, stripScoringMeta } from "./taker-view";

const SECRET = "synthetic-secret";
const GE_WORD = "synthetic-category";

describe("taker payload", () => {
  it("strips answer keys, accepted lists, GE lists, and provisional flags", () => {
    const [item] = presentTakerItems([
      {
        id: 1,
        question_text: "synthetic stem",
        scoring_meta: JSON.stringify({
          subtest: "GE",
          answer_type: "text",
          key: SECRET,
          key_letter: "E",
          key_provisional: true,
          candidate_keys: [SECRET],
          accepted: [SECRET],
          accepted_digits: ["9"],
          ge_answers: { "2": [GE_WORD], "1": ["weaker-synthetic"] },
          image: "/api/test-assets/tests/ist/fa/FA_117.png",
        }),
        options: [{ value: "1", label: "pilihan", score_key: SECRET, score_val: 9, image: "/tests/wpt/WPT_07_opt1.png" }],
      },
    ]);
    const json = JSON.stringify(item);
    assert.equal(json.includes(SECRET), false);
    assert.equal(json.includes(GE_WORD), false);
    assert.equal(json.includes("key_provisional"), false);
    assert.equal(json.includes("ge_answers"), false);
    assert.equal(json.includes("accepted"), false);
    assert.equal((item.scoring_meta as { subtest?: string; answer_type?: string }).subtest, "GE");
    assert.equal((item.scoring_meta as { answer_type?: string }).answer_type, "text");
    assert.equal((item.scoring_meta as { image?: string }).image, "/api/test-assets/tests/ist/fa/FA_117.png");
    const option = (item.options as { image?: string; score_key?: string }[])[0];
    assert.equal(option.score_key, undefined);
    assert.equal(option.image, "/tests/wpt/WPT_07_opt1.png");
  });

  it("keeps Big Five factor keying", () => {
    const meta = stripScoringMeta({ factor: "E", keyed: "+", dimension: "E", reversed: false });
    assert.equal(meta?.factor, "E");
    assert.equal(meta?.keyed, "+");
  });

  it("hides provisional item numbers on the result page and appends the result token to figure urls", () => {
    const view = presentTakerResult(
      {
        result_type: "100",
        interpretation: {
          description: "IQ 100. 2 butir memakai kunci sementara karena sumber kunci berbeda (no. 4, 9). Hasil perlu ditinjau psikolog.",
          detail: {
            kind: "ist",
            provisionalItems: [4, 9],
            notes: ["Usia peserta tidak tercatat.", "2 butir memakai kunci sementara karena sumber kunci berbeda (no. 4, 9)."],
            figure: "/api/test-assets/tests/ist/fa/FA_117.png",
          },
        },
      },
      "result-token",
    );
    const json = JSON.stringify(view);
    assert.equal(json.includes("provisionalItems"), false);
    assert.equal(json.includes("kunci sementara"), false);
    assert.equal(json.includes("no. 4"), false);
    assert.match(json, /FA_117\.png\?t=result-token/);
    assert.match(view.interpretation.description, /IQ 100/);
  });
});
