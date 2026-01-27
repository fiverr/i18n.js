import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { instance } from "../src/index.ts";

describe("Instance", () => {
  it("exports an I18n instance", () => {
    assert.equal(instance.constructor.name, "I18n");
  });
});
