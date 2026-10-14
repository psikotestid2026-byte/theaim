import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EXPIRY_AUTO_SUBMIT_HEADING, expiryAnsweredLine } from "./test-timer";
import { stampExpirySubmission, unansweredCount } from "./test-completion";

describe("completion completeness", () => {
  it("counts items that have no stored answer", () => {
    const items = [
      { id: 1, item_order: 1, options: [{ value: "1" }] },
      { id: 2, item_order: 2, options: [{ value: "1" }] },
      { id: 3, item_order: 3, options: [{ value: "1" }] },
    ];
    assert.equal(unansweredCount("wpt", items, { 1: "2", 3: "1" }), 1);
    assert.equal(unansweredCount("wpt", items, { 1: "2", 2: "1", 3: "4" }), 0);
  });

  it("records that a timed result was submitted because the clock ran out", () => {
    const stamped = stampExpirySubmission(
      {
        raw_scores: { benar: 1, iq: 80 },
        result_type: "80",
        result_label: "Di bawah rata-rata",
        interpretation: {
          description: "Jawaban benar: 1 dari 50.",
          strengths: [],
          challenges: [],
          detail: { kind: "wpt", rawScore: 1, iq: 80 },
        },
        wa_summary_text: "Hasil WPT",
      },
      2,
      50,
    );
    assert.equal(stamped.interpretation.detail?.submittedByExpiry, true);
    assert.equal(stamped.interpretation.detail?.answered, 2);
    assert.equal(stamped.interpretation.detail?.total, 50);
    assert.equal(EXPIRY_AUTO_SUBMIT_HEADING, "Waktu habis — jawaban Anda dikirim otomatis");
    assert.equal(expiryAnsweredLine(2, 50), "2 dari 50 soal terjawab");
    assert.equal(stamped.interpretation.description, "Jawaban benar: 1 dari 50.");
  });
});
