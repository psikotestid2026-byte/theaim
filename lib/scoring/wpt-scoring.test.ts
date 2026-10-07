import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { checkWptAnswer, WPT_ANSWER_KEYS, WPT_ITEMS_WITHOUT_CORRECT_OPTION } from "./ruangtes/wpt";

type BankRow = {
  code: string;
  order_number: number;
  question_data: { options?: string[] };
};

const banks = JSON.parse(readFileSync(new URL("../../db/seed-data/overlap/question_banks.json", import.meta.url), "utf8")) as BankRow[];
const wpt = banks.filter((row) => row.code === "wpt").sort((a, b) => a.order_number - b.order_number);
const unscored = new Set<number>(WPT_ITEMS_WITHOUT_CORRECT_OPTION);

describe("WPT exact option matching", () => {
  it("scores exactly one printed option, or none when the correct letter is not offered", () => {
    assert.equal(wpt.length, 50);
    for (const row of wpt) {
      const options = row.question_data.options ?? [];
      const hits = options.filter((option) => checkWptAnswer(row.order_number, option));
      if (unscored.has(row.order_number)) {
        assert.deepEqual(hits, [], `Q${row.order_number} should not mark a wrong letter correct`);
      } else {
        assert.equal(hits.length, 1, `Q${row.order_number} scored ${JSON.stringify(hits)}`);
      }
    }
  });

  it("does not treat lookalike wrong answers as correct", () => {
    assert.equal(checkWptAnswer(4, "Ya"), false);
    assert.equal(checkWptAnswer(4, "Tidak Tahu"), false);
    assert.equal(checkWptAnswer(4, "Tidak"), true);
    assert.equal(checkWptAnswer(6, "Jarang"), false);
    assert.equal(checkWptAnswer(6, "Luar Biasa"), true);
    assert.equal(checkWptAnswer(10, "Bau wangi"), false);
    assert.equal(checkWptAnswer(10, "Hidung"), true);
    assert.equal(checkWptAnswer(17, "A"), false);
    assert.equal(checkWptAnswer(17, "S"), false);
    assert.equal(checkWptAnswer(17, "P"), false);
    assert.equal(checkWptAnswer(17, "D"), false);
    assert.equal(checkWptAnswer(17, "M"), false);
    assert.equal(checkWptAnswer(17, "g"), true);
    assert.equal(checkWptAnswer(23, "1 dan 2"), false);
    assert.equal(checkWptAnswer(23, "1 dan 3"), true);
    assert.equal(checkWptAnswer(27, "3 sen"), false);
    assert.equal(checkWptAnswer(27, "3.33 sen"), true);
    assert.equal(checkWptAnswer(31, "1/10000"), false);
    assert.equal(checkWptAnswer(31, "1/100000"), true);
  });

  it("accepts an explicit equivalent writing of the same answer", () => {
    assert.equal(checkWptAnswer(8, "0,125"), true);
    assert.equal(checkWptAnswer(12, "6000"), true);
    assert.equal(checkWptAnswer(27, "3,33"), true);
    assert.ok(WPT_ANSWER_KEYS[6].length >= 1);
    assert.equal(WPT_ANSWER_KEYS[6].includes("Jarang"), false);
  });
});
