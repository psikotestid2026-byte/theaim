import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { msaiResultBadge } from "./msai-label";

describe("MSAI result badge", () => {
  it("prints two decimals from the stored quadrant score, not the saved label", () => {
    const badge = msaiResultBadge({
      result_label: "Adhocracy · 1.2",
      raw_scores: { Adhocracy: 1.2 },
      interpretation: {
        detail: {
          kind: "msai",
          quadrantScores: { Adhocracy: 1.2, Market: 0.8, Hierarchy: 0.4, Clan: 0.2 },
        },
      },
    });
    assert.equal(badge, "Adhocracy · 1.20");
  });

  it("ignores a one-decimal label when the numeric score is different", () => {
    const badge = msaiResultBadge({
      result_label: "Adhocracy · 1.2",
      interpretation: {
        detail: { quadrantScores: { Adhocracy: 1.25, Clan: 1.2 } },
      },
    });
    assert.equal(badge, "Adhocracy · 1.25");
  });

  it("names every tied quadrant from the numbers", () => {
    const badge = msaiResultBadge({
      result_label: "Adhocracy · 3",
      interpretation: {
        detail: {
          quadrantScores: { Adhocracy: 3, Market: 3, Hierarchy: 3, Clan: 3 },
        },
      },
    });
    assert.equal(badge, "Seri · Adhocracy, Clan, Hierarchy, Market · 3.00");
  });
});
