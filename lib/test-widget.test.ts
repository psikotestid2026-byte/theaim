import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { widgetForItem } from "./test-widget";

const fiveNumeric = [1, 2, 3, 4, 5].map((value) => ({ value: String(value), label: `Pilihan ${value}` }));

describe("answer widget selection", () => {
  it("uses a vertical choice list for cognitive and paired-statement tests", () => {
    assert.equal(widgetForItem("wpt", { item_order: 1, options: fiveNumeric }), "choice");
    assert.equal(widgetForItem("ist", { item_order: 1, options: fiveNumeric }), "choice");
    assert.equal(widgetForItem("mbti", { item_order: 1, options: [{ value: "1" }, { value: "2" }] }), "choice");
    assert.equal(widgetForItem("papi", { item_order: 1, options: [{ value: "A" }, { value: "B" }] }), "choice");
    assert.equal(widgetForItem("riasec", { item_order: 1, options: [{ value: "1" }, { value: "2" }] }), "choice");
    assert.equal(widgetForItem("msdt", { item_order: 1, options: [{ value: "A" }, { value: "B" }] }), "choice");
  });

  it("keeps DISC on the P/K widget and agreement scales on Likert", () => {
    assert.equal(widgetForItem("disc", { item_order: 1, options: four("x") }), "disc");
    assert.equal(widgetForItem("bigfive", { item_order: 1, options: fiveNumeric }), "likert");
    assert.equal(widgetForItem("enneagram", { item_order: 1, options: fiveNumeric }), "likert");
    assert.equal(widgetForItem("talents_mapping", { item_order: 1, options: fiveNumeric }), "likert");
    assert.equal(widgetForItem("msai", { item_order: 1, options: fiveNumeric }), "likert");
    assert.equal(widgetForItem("msai", { item_order: 61, options: fiveNumeric }), "likert");
    assert.equal(widgetForItem("msai", { item_order: 76, options: fiveNumeric }), "likert");
  });

  it("renders MSAI career items as full statements, not a 1–5 row", () => {
    assert.equal(widgetForItem("msai", { item_order: 74, options: fiveNumeric }), "choice");
    assert.equal(widgetForItem("msai", { item_order: 75, section: "career", options: fiveNumeric }), "choice");
  });

  it("uses a typed answer for WPT isian and IST GE/RA/ZR items", () => {
    assert.equal(widgetForItem("wpt", { item_order: 8, options: [], scoring_meta: { answer_type: "text" } }), "text");
    assert.equal(widgetForItem("ist", { item_order: 77, section: "RA", options: [], scoring_meta: { answer_type: "number" } }), "text");
    assert.equal(widgetForItem("ist", { item_order: 1, section: "SE", options: fiveNumeric, scoring_meta: { answer_type: "choice" } }), "choice");
  });
});

function four(label: string) {
  return [0, 1, 2, 3].map((index) => ({ value: String(index + 1), label: `${label}${index}` }));
}
