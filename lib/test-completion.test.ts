import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { unansweredCount } from "./test-completion";

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
});
