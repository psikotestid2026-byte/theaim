import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { choicePresentation } from "./choice-option";

describe("choice presentation", () => {
  it("shows a letter and an accessible name when the option is a figure", () => {
    const shown = choicePresentation(0, { label: "Kubus a", image: "/api/test-assets/tests/ist/wu/WU_option_a.png", value: "1" } as { label: string; image: string });
    assert.equal(shown.letter, "A");
    assert.equal(shown.text, "A");
    assert.equal(shown.ariaLabel, "Pilihan A");
    assert.equal(choicePresentation(4, { image: "/api/test-assets/tests/ist/wu/WU_option_e.png" }).ariaLabel, "Pilihan E");
  });

  it("keeps the stored text label when there is no figure", () => {
    const shown = choicePresentation(0, { label: "1" });
    assert.equal(shown.text, "1");
    assert.equal(shown.ariaLabel, undefined);
  });
});
