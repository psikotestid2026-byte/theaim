import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { asId } from "./ids";
import { canStartTest, canWriteTest, initialQuestionIndex } from "./test-access";
import { completeBody, testResponseBody } from "./validators/test-attempt";

const token = "11111111-1111-4111-8111-111111111111";

describe("id coercion", () => {
  it("accepts bigint strings from Neon", () => {
    assert.equal(asId("3"), 3);
    assert.equal(asId(3), 3);
    assert.equal(asId(BigInt(12)), 12);
  });

  it("rejects blank and non-integers", () => {
    assert.throws(() => asId(""));
    assert.throws(() => asId("1.5"));
    assert.throws(() => asId(0));
  });

  it("parses test-response and complete bodies with string ids", () => {
    const saved = testResponseBody.parse({
      token,
      session_id: "3",
      item_id: "42",
      answer_value: "5",
    });
    assert.equal(saved.session_id, 3);
    assert.equal(saved.item_id, 42);

    const done = completeBody.parse({ token, session_id: "3" });
    assert.equal(done.session_id, 3);
  });
});

describe("test start gate", () => {
  it("allows only an in-progress session into /mulai and answer writes", () => {
    assert.equal(canStartTest("in_progress"), true);
    assert.equal(canWriteTest("in_progress"), true);
    for (const status of ["issued", "confirming", "completed", "locked", "expired", "revoked"]) {
      assert.equal(canStartTest(status), false);
      assert.equal(canWriteTest(status), false);
    }
  });

  it("lands on the last question when every answer is already saved", () => {
    const ids = [10, 11, 12];
    const index = initialQuestionIndex(ids, () => true);
    assert.equal(index, 2);
    assert.equal(initialQuestionIndex(ids, (id) => id !== 11), 1);
  });
});
