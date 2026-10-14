import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { IST_AGE_GROUPS, IST_SUBTEST_CODES, type IstScoringTables, type IstSubtestCode } from "../ist-types";
import { computeResult } from "./index";
import {
  calculateIstScore,
  digitAnswerIsCorrect,
  geItemPoints,
  istAgeGroup,
  istRwToSw,
  istSwToIq,
  istTotalSw,
  IST_NORM_NOTE,
} from "./ist";
import type { TestItem } from "@/types/db";

function syntheticTables(): IstScoringTables {
  const rwToSw = {} as IstScoringTables["rwToSw"];
  const gesamt = {} as IstScoringTables["gesamt"];
  for (const group of IST_AGE_GROUPS) {
    rwToSw[group] = {};
    for (const code of IST_SUBTEST_CODES) {
      rwToSw[group][code] = Array.from({ length: 21 }, (_, index) => 50 + index);
    }
    gesamt[group] = [[0, 20, 70], [21, 200, 90]];
  }
  rwToSw["21-25"].AN[2] = null;
  return {
    subtests: IST_SUBTEST_CODES.map((code) => ({ code, name: `Synthetic ${code}` })),
    geRawToRw: [0, 1, 2, 4],
    rwToSw,
    gesamt,
    swToIq: [[40, 80, 10], [70, 100, 50], [90, 120, 90]],
    categories: [{ iq_min: 110, label: "Tinggi" }, { iq_max: 109, label: "Lain" }],
    provisionalItems: [7],
  };
}

function item(order: number, code: IstSubtestCode, meta: Record<string, unknown>): TestItem {
  return {
    id: order,
    test_code: "ist",
    section: code,
    item_order: order,
    question_text: `synthetic ${order}`,
    options: [{ value: "z", label: "pilihan", score_key: "", score_val: 0 }],
    scoring_meta: { subtest: code, ...meta },
    created_at: "",
    updated_at: "",
  };
}

describe("IST item scoring", () => {
  it("scores GE 2/1/0 from the answer lists", () => {
    const ge = { ge_answers: { "2": ["warna-sintetis"], "1": ["lemah-sintetis"] } };
    assert.equal(geItemPoints(ge, "Warna sintetis"), 2);
    assert.equal(geItemPoints(ge, " lemah-sintetis "), 1);
    assert.equal(geItemPoints(ge, "salah"), 0);
    assert.equal(geItemPoints(ge, ""), 0);
  });

  it("scores RA/ZR by digit set", () => {
    const ra = { key: "1357" };
    assert.equal(digitAnswerIsCorrect(ra, "1357"), true);
    assert.equal(digitAnswerIsCorrect(ra, "7531"), true);
    assert.equal(digitAnswerIsCorrect(ra, "135"), false);
    assert.equal(digitAnswerIsCorrect(ra, "13578"), false);
    assert.equal(digitAnswerIsCorrect(ra, "1,3"), false);
  });
});

describe("IST norms", () => {
  const tables = syntheticTables();

  it("uses the 21–25 group when age is missing and flags it", () => {
    assert.equal(istAgeGroup(undefined).group, "21-25");
    assert.ok(istAgeGroup(undefined).note.toLowerCase().includes(IST_NORM_NOTE.toLowerCase()));
    assert.equal(istAgeGroup(33).group, "31-35");
    assert.equal(istAgeGroup(17).group, "21-25");
    assert.equal(istAgeGroup(52).group, "36-40");
    assert.ok(istAgeGroup(52).note.includes("di luar tabel"));
  });

  it("converts RW→SW, total RW→SW, and SW→IQ from the supplied tables", () => {
    assert.deepEqual(istRwToSw(tables, "21-25", "SE", 0), { sw: 50, filled: false });
    assert.deepEqual(istRwToSw(tables, "21-25", "AN", 2), { sw: 51, filled: true });
    assert.equal(istTotalSw(tables, "21-25", 3), 70);
    assert.equal(istTotalSw(tables, "21-25", 21), 90);
    assert.deepEqual(istSwToIq(tables, 70), { iq: 100, percentile: 50 });
    assert.deepEqual(istSwToIq(tables, 80), { iq: 100, percentile: 50 });
  });
});

describe("IST full result (synthetic tables)", () => {
  const tables = syntheticTables();

  it("sums synthetic correct items and reads IQ from the supplied table", () => {
    const items = [
      item(1, "SE", { answer_type: "choice", key: "z" }),
      item(2, "GE", { answer_type: "text", ge_answers: { "2": ["warna-sintetis"] } }),
      item(7, "WA", { answer_type: "choice", key: "z" }),
    ];
    const score = calculateIstScore(items, { 1: "z", 2: "warna sintetis" }, tables);
    assert.equal(score.subtests.find((row) => row.code === "SE")?.rw, 1);
    assert.equal(score.subtests.find((row) => row.code === "GE")?.raw, 2);
    assert.equal(score.subtests.find((row) => row.code === "GE")?.rw, 2);
    assert.equal(score.totalRw, 3);
    assert.equal(score.totalSw, 70);
    assert.equal(score.iq, 100);
    assert.equal(score.category, "Lain");
    assert.deepEqual(score.provisionalItems, [7]);
    assert.ok(score.notes.some((note) => note.includes("kunci sementara")));
    assert.ok(score.notes.some((note) => note.includes("tanpa butir")));
  });

  it("clamps a GE raw score above the synthetic conversion table", () => {
    const ge = item(3, "GE", { answer_type: "text", ge_answers: { "2": ["warna-sintetis"] } });
    const score = calculateIstScore([ge, { ...ge, id: 4, item_order: 4 }], { 3: "warna-sintetis", 4: "warna-sintetis" }, tables);
    assert.equal(score.subtests.find((row) => row.code === "GE")?.raw, 4);
    assert.equal(score.subtests.find((row) => row.code === "GE")?.rw, 4);
    assert.ok(score.notes.some((note) => note.includes("di atas tabel konversi")));
  });

  it("computeResult returns the RW/SW/IQ detail and refuses to score without tables", () => {
    const items = [item(1, "SE", { answer_type: "choice", key: "z" })];
    assert.throws(() => computeResult("ist", {}, items), /IST scoring tables are not loaded/);
    const result = computeResult("ist", {}, items, { ist: tables });
    const detail = result.interpretation.detail as { kind: string; subtests: unknown[]; iq: number; notes: string[] };
    assert.equal(detail.kind, "ist");
    assert.equal(detail.subtests.length, 9);
    assert.equal(result.raw_scores.total_rw, 0);
    assert.equal(detail.iq, 100);
    assert.ok(detail.notes[0].toLowerCase().includes("norma usia 21–40 digunakan"));
  });
});
