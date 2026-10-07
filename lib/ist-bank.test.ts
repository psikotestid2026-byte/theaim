import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { incompleteTestBank, inspectIstBank, IST_BANK_INCOMPLETE } from "./ist-bank";

type BankRow = {
  code: string;
  order_number: number;
  question_type: string;
  question_data: { text?: string; options?: string[] };
};

describe("IST bank readiness", () => {
  it("blocks the seeded bank instead of presenting a broken test", () => {
    const banks = JSON.parse(readFileSync(new URL("../db/seed-data/overlap/question_banks.json", import.meta.url), "utf8")) as BankRow[];
    const items = banks.filter((row) => row.code === "ist").map((row) => {
      const text = (row.question_data.text ?? "").trim();
      return {
        item_order: row.order_number,
        question_text: text || "Stem soal tidak tersedia pada berkas sumber.",
        section: row.question_type,
        options: (row.question_data.options ?? []).map((label, index) => ({ value: String(index + 1), label })),
      };
    });
    const report = inspectIstBank(items);
    assert.equal(report.usable, false);
    assert.ok(report.letterOnlyItems >= 77);
    assert.ok(report.missingStems >= 20);
    assert.ok(report.strayOptionItems >= 1);
    assert.deepEqual(report.missingSubtests, ["FA", "WU"]);
    assert.equal(report.hasMemorizePhase, false);
  });

  it("accepts a bank that has texts, figure subtests, and a memorize phase", () => {
    const report = inspectIstBank([
      {
        item_order: 1,
        question_text: "Lengkapi kalimat ini.",
        section: "SE",
        options: [{ label: "satu" }, { label: "dua" }],
      },
      {
        item_order: 2,
        question_text: "Gambar bentuk.",
        section: "FA",
        scoring_meta: { subtest: "FA", image: "/ist/fa-1.png" },
        options: [{ label: "A" }, { label: "B" }],
      },
      {
        item_order: 3,
        question_text: "Susun kubus.",
        section: "WU",
        scoring_meta: { subtest: "WU" },
        options: [{ label: "pola 1" }],
      },
      {
        item_order: 4,
        question_text: "Tahap menghafal kata.",
        section: "ME",
        scoring_meta: { subtest: "ME", phase: "memorize" },
        options: [{ label: "Siap" }],
      },
    ]);
    assert.equal(report.usable, true);
    assert.deepEqual(report.messages, []);
    assert.equal(incompleteTestBank("ist", [
      {
        item_order: 1,
        question_text: "Lengkapi kalimat ini.",
        section: "SE",
        options: [{ label: "satu" }, { label: "dua" }],
      },
      {
        item_order: 2,
        question_text: "Gambar bentuk.",
        section: "FA",
        scoring_meta: { subtest: "FA", image: "/ist/fa-1.png" },
        options: [{ label: "A" }, { label: "B" }],
      },
      {
        item_order: 3,
        question_text: "Susun kubus.",
        section: "WU",
        scoring_meta: { subtest: "WU" },
        options: [{ label: "pola 1" }],
      },
      {
        item_order: 4,
        question_text: "Tahap menghafal kata.",
        section: "ME",
        scoring_meta: { subtest: "ME", phase: "memorize" },
        options: [{ label: "Siap" }],
      },
    ]), null);
  });

  it("blocks only an incomplete IST bank and leaves other tests alone", () => {
    const broken = inspectIstBank([]);
    assert.equal(broken.usable, false);
    const gate = incompleteTestBank("IST", []);
    assert.equal(gate?.usable, false);
    assert.equal(IST_BANK_INCOMPLETE, "bank_incomplete");
    assert.equal(incompleteTestBank("wpt", []), null);
  });
});
