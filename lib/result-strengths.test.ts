import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { TestItem, TestItemOption } from "@/types/db";
import { computeResult } from "./scoring/index";
import { presentStrengths, SUMMARY_HEADING } from "./result-strengths";

function item(code: string): TestItem {
  const options: TestItemOption[] = [1, 2, 3, 4, 5].map((value) => ({
    value: String(value),
    label: String(value),
    score_key: "",
    score_val: value,
  }));
  return {
    id: 1,
    test_code: code,
    section: null,
    item_order: 1,
    question_text: "Soal",
    options,
    scoring_meta: null,
    created_at: "",
    updated_at: "",
  };
}

describe("strength sections", () => {
  it("moves a stored very-low WPT score out of Kekuatan utama", () => {
    assert.equal(SUMMARY_HEADING, "Ringkasan");
    const scored = computeResult("wpt", {}, [item("wpt")]);
    assert.deepEqual(scored.interpretation.strengths, []);
    const view = presentStrengths({
      testCode: "wpt",
      strengths: ["IQ 59", "Sangat Rendah"],
      detail: { kind: "wpt", rawScore: 0, iq: 59, label: "Sangat Rendah" },
    });
    assert.deepEqual(view.strengths, []);
    assert.deepEqual(view.summary, ["IQ 59", "Sangat Rendah"]);
  });

  it("keeps an above-average WPT score as a strength and leaves average as a summary", () => {
    const high = presentStrengths({
      testCode: "wpt",
      strengths: ["IQ 120", "Superior"],
      detail: { kind: "wpt", iq: 120, label: "Superior" },
    });
    assert.deepEqual(high.strengths, ["IQ 120", "Superior"]);
    assert.deepEqual(high.summary, []);

    const average = presentStrengths({
      testCode: "wpt",
      strengths: ["IQ 100", "Rata-rata"],
      detail: { kind: "wpt", iq: 100, label: "Rata-rata" },
    });
    assert.deepEqual(average.strengths, []);
    assert.deepEqual(average.summary, ["IQ 100", "Rata-rata"]);

    const above = presentStrengths({
      testCode: "wpt",
      strengths: ["IQ 111", "Rata-rata Atas"],
      detail: { kind: "wpt", iq: 111, label: "Rata-rata Atas" },
    });
    assert.deepEqual(above.strengths, ["IQ 111", "Rata-rata Atas"]);
  });

  it("splits IST subtests so only an above-midpoint score is a strength", () => {
    const low = presentStrengths({
      testCode: "ist",
      strengths: ["RA 0/20", "ZR 0/20"],
      detail: { kind: "ist", raScore: 0, zrScore: 0, numeric: 0 },
    });
    assert.deepEqual(low.strengths, []);
    assert.deepEqual(low.summary, ["RA 0/20", "ZR 0/20"]);

    const mixed = presentStrengths({
      testCode: "ist",
      strengths: ["RA 15/20", "ZR 4/20"],
      detail: { kind: "ist", raScore: 15, zrScore: 4, numeric: 19 },
    });
    assert.deepEqual(mixed.strengths, ["RA 15/20"]);
    assert.deepEqual(mixed.summary, ["ZR 4/20"]);

    const midpoint = presentStrengths({
      testCode: "ist",
      detail: { kind: "ist", raScore: 11, zrScore: 10 },
    });
    assert.deepEqual(midpoint.strengths, ["RA 11/20"]);
    assert.deepEqual(midpoint.summary, ["ZR 10/20"]);
  });

  it("keeps only high MSDT orientations, including on a stored Rendah list", () => {
    const view = presentStrengths({
      testCode: "msdt",
      strengths: ["Orientasi tugas: Rendah", "Orientasi relasi: Tinggi", "Efektivitas: Rendah"],
      detail: {
        kind: "msdt",
        orientationCategory: { TO: "Rendah", RO: "Tinggi", E: "Rendah" },
      },
    });
    assert.deepEqual(view.strengths, ["Orientasi relasi: Tinggi"]);
    assert.deepEqual(view.summary, []);
  });

  it("keeps a high Big Five factor and drops high Neuroticism and a low factor", () => {
    const view = presentStrengths({
      testCode: "bigfive",
      strengths: ["Neuroticism: cemas", "Agreeableness: sabar"],
      detail: {
        kind: "bigfive",
        dimensions: [
          { code: "E", name: "Ekstraversi", category: "Tinggi", narrative: "ramah", itemCount: 9 },
          { code: "N", name: "Neuroticism", category: "Tinggi", narrative: "cemas", itemCount: 15 },
          { code: "A", name: "Agreeableness", category: "Tinggi", narrative: "sabar", itemCount: 1 },
          { code: "C", name: "Conscientiousness", category: "Rendah", narrative: "longgar", itemCount: 9 },
        ],
      },
    });
    assert.deepEqual(view.strengths, ["Ekstraversi: ramah"]);
  });

  it("lists a PAPI aspect only at the high band", () => {
    const view = presentStrengths({
      testCode: "papi",
      strengths: ["X — Need for Recognition: Rendah hati"],
      detail: {
        kind: "papi",
        aspects: [
          { code: "N", name: "Need to Finish", score: 7, note: "Menuntaskan pekerjaan." },
          { code: "X", name: "Need for Recognition", score: 2, note: "Rendah hati dan tidak terlalu membutuhkan perhatian." },
        ],
      },
    });
    assert.deepEqual(view.strengths, ["N — Need to Finish: Menuntaskan pekerjaan."]);
  });

  it("lists an MSAI skill only when the gap is not a shortfall", () => {
    const view = presentStrengths({
      testCode: "msai",
      strengths: ["Managing Innovation", "Managing Teams"],
      detail: {
        kind: "msai",
        skills: [
          { name: "Managing Innovation", gap: -0.4, actual: 4.2 },
          { name: "Managing Teams", gap: 1.2, actual: 2 },
        ],
      },
    });
    assert.deepEqual(view.strengths, ["Managing Innovation"]);
  });

  it("lists an MBTI pole only when it leads its pair by a majority", () => {
    const thin = presentStrengths({
      testCode: "mbti",
      strengths: ["I: 8%", "N: 4%", "F: 6%", "P: 3%"],
      detail: { kind: "mbti", percent: { E: 4, I: 8, S: 2, N: 4, T: 3, F: 6, J: 1, P: 3 } },
    });
    assert.deepEqual(thin.strengths, []);

    const clear = presentStrengths({
      testCode: "mbti",
      detail: { kind: "mbti", percent: { E: 20, I: 70, S: 65, N: 30, T: 60, F: 40, J: 55, P: 40 } },
    });
    assert.deepEqual(clear.strengths, ["I: 70%", "S: 65%", "T: 60%", "J: 55%"]);
  });

  it("drops an Enneagram liability from strengths and keeps a positive trait", () => {
    const view = presentStrengths({
      testCode: "enneagram",
      strengths: ["Produktif", "Depresif.", "Tidak mudah menyerah", "Obsesif kompulsif (kelainan)."],
      detail: { kind: "enneagram" },
    });
    assert.deepEqual(view.strengths, ["Produktif", "Tidak mudah menyerah"]);
  });

  it("keeps DISC guidance and RIASEC professions, and drops a low-band line", () => {
    const disc = presentStrengths({
      testCode: "disc",
      strengths: [
        "Beri ruang otonomi, target yang menantang, dan kewenangan mengambil keputusan.",
        "Undershift: keempat dimensi Change pada atau di bawah nol.",
      ],
      detail: { kind: "disc" },
    });
    assert.deepEqual(disc.strengths, [
      "Beri ruang otonomi, target yang menantang, dan kewenangan mengambil keputusan.",
    ]);

    const riasec = presentStrengths({
      testCode: "riasec",
      strengths: ["Insinyur", "Peneliti"],
      detail: { kind: "riasec" },
    });
    assert.deepEqual(riasec.strengths, ["Insinyur", "Peneliti"]);
  });

  it("keeps a dominant Talents Mapping theme and drops a very-weak label", () => {
    const view = presentStrengths({
      testCode: "talents_mapping",
      strengths: ["Achiever (Executing)", "Tema sangat lemah"],
    });
    assert.deepEqual(view.strengths, ["Achiever (Executing)"]);
    assert.deepEqual(view.summary, []);
  });
});
