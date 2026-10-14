import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { istWptBankViolations, scanRepoForIstWptBanks } from "./ist-bank-guard";

describe("IST/WPT bank guard", () => {
  it("flags items, keys, and norms and ignores a catalog row", () => {
    const code = "ist";
    const other = "wpt";
    assert.ok(istWptBankViolations({ code, order_number: 1, question_data: { text: "x" } }).length > 0);
    assert.ok(istWptBankViolations({ code: other, raw_score: "1", norm_score: "2", label: "n" }).length > 0);
    assert.ok(istWptBankViolations({ [other]: { norms: { iq_range: [] } } }).length > 0);
    assert.deepEqual(istWptBankViolations({ code, name: "label", formula_type: "ist_norms", instructions: "short" }), []);
  });

  it("finds no IST or WPT keys or norms in the repo", () => {
    const hits = scanRepoForIstWptBanks(process.cwd());
    assert.deepEqual(hits, []);
  });
});
