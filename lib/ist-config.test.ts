import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { parseIstMemorizeList, parseIstPublicSubtests, parseIstSchedule, parseIstScoringTables } from "./ist-config";

const SECRET_WORD = "synthetic-memorize-word";

const config = {
  subtests: [
    { code: "SE", name: "Synthetic SE", from: 1, to: 1, timeLimitSec: 30, instructions: "Petunjuk sintetis", examples: [{ stem: "contoh", options: ["a", "b"], key: "A" }] },
    {
      code: "ME",
      name: "Synthetic ME",
      from: 2,
      to: 2,
      timeLimitSec: 40,
      memorizeSec: 15,
      instructions: "Hafalkan",
      examples: [{ key: "B" }],
      exampleImage: "/api/test-assets/tests/ist/fa/FA_example_page.png",
      memorizeList: { GRUP: [SECRET_WORD] },
    },
  ],
  ge_raw_to_rw: [0, 2],
  iq_categories: [{ iq_min: 100, label: "Tinggi" }],
  provisional_items: [2],
};

describe("IST config parser", () => {
  it("keeps instructions and examples and drops the memorize word list from the runner payload", () => {
    const publicRows = parseIstPublicSubtests(config);
    assert.equal(publicRows?.length, 2);
    assert.equal(publicRows?.[0].instructions, "Petunjuk sintetis");
    assert.equal(publicRows?.[0].examples[0].key, "A");
    assert.equal(publicRows?.[1].memorizeSec, 15);
    assert.equal(publicRows?.[1].exampleImage?.includes("FA_example_page.png"), true);
    assert.equal(JSON.stringify(publicRows).includes(SECRET_WORD), false);
    assert.equal(JSON.stringify(publicRows).includes("memorizeList"), false);
  });

  it("reads the memorize list only from the dedicated parser", () => {
    const me = (config.subtests[1] as { memorizeList: unknown }).memorizeList;
    assert.deepEqual(parseIstMemorizeList(me), { GRUP: [SECRET_WORD] });
    assert.equal(parseIstMemorizeList({ GRUP: [] }), null);
  });

  it("builds scoring tables from flat norm rows and leaves a missing cell null", () => {
    const tables = parseIstScoringTables(config, [
      { age_group: "21-25", raw_score: "SE:0", norm_score: "40", label: "SW" },
      { age_group: "21-25", raw_score: "SE:1", norm_score: "55", label: "SW" },
      { age_group: "21-25", raw_score: "GESAMT:0-9", norm_score: "70", label: "SW" },
      { age_group: "SW_IQ", raw_score: "70", norm_score: "100", label: "IQ", description: "persentil 50" },
    ]);
    assert.ok(tables);
    assert.equal(tables?.rwToSw["21-25"].SE[0], 40);
    assert.equal(tables?.rwToSw["21-25"].SE[2], null);
    assert.deepEqual(tables?.gesamt["21-25"][0], [0, 9, 70]);
    assert.deepEqual(tables?.swToIq[0], [70, 100, 50]);
    assert.deepEqual(tables?.provisionalItems, [2]);
    assert.equal(JSON.stringify(tables).includes(SECRET_WORD), false);
  });

  it("rejects a config that has no subtests", () => {
    assert.equal(parseIstSchedule({ subtests: [] }), null);
    assert.equal(parseIstScoringTables({ subtests: config.subtests }, []), null);
  });
});

describe("IST content queries", () => {
  it("selects the memorize word list in only the memorize query", () => {
    const src = readFileSync(new URL("./queries/ist-content.ts", import.meta.url), "utf8");
    const statements = [...src.matchAll(/sql`([\s\S]*?)`/g)].map((match) => match[1]);
    const mentioning = statements.filter((statement) => statement.includes("memorizeList"));
    assert.equal(mentioning.length, 1);
    assert.match(mentioning[0], /memorize_list/);
    assert.equal(statements.some((statement) => statement.includes("instructions")), true);
  });
});
