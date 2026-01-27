import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { I18n } from "../src/index.ts";

describe("missing keys report", () => {
  it("reports missing keys", () => {
    let reported = false;
    const i18n = new I18n({
      $scope: "some.scope",
      missing: (key, scope, translations) => {
        reported = true;
        assert.equal(scope, "some.scope");
        assert.equal(key, "a.missing.key");
        assert.equal(typeof translations, "object");
        assert.equal(Object.keys(translations ?? {}).length, 0);
        return undefined;
      },
    });

    i18n.translate("a.missing.key");
    assert.equal(reported, true);
  });

  it("reports missing key for undefined", () => {
    let reported = false;
    const i18n = new I18n({
      $scope: "some.scope",
      missing: (key, scope, translations) => {
        reported = true;
        assert.equal(scope, "some.scope");
        assert.equal(key, "");
        assert.equal(typeof translations, "object");
        assert.equal(Object.keys(translations ?? {}).length, 0);
        return undefined;
      },
    });

    i18n.translate();
    assert.equal(reported, true);
  });

  it("uses last part of the key on missing", () => {
    let reported = false;
    const i18n = new I18n({
      $scope: "some.scope",
      missing: () => {
        reported = true;
        return undefined;
      },
    });

    const value = i18n.translate("some.thing.is_missing");
    assert.equal(value, "is missing");
    assert.equal(reported, true);
  });

  it("uses onmiss return value as fallback", () => {
    const i18n = new I18n({
      $scope: "some.scope",
      missing: () => "Fallback",
    });

    const value = i18n.translate("some.thing.is_missing");
    assert.equal(value, "Fallback");
  });

  it("uses last part of the key on empty when no return value was given", () => {
    const i18n = new I18n({
      $scope: "some.scope",
      translations: {
        base: {
          some_key: "",
        },
      },
    });

    const value = i18n.translate("base.some_key");
    assert.equal(value, "some key");
  });

  it("uses onempty return value as fallback", () => {
    const i18n = new I18n({
      $scope: "some.scope",
      translations: {
        base: {
          some_key: "",
        },
      },
      empty: () => "Fallback",
    });

    const value = i18n.translate("base.some_key");
    assert.equal(value, "Fallback");
  });

  ["", null].forEach((item) =>
    it(`reports empty value for ${item}`, () => {
      let reported = false;
      const i18n = new I18n({
        $scope: "some.scope",
        translations: {
          base: {
            some_key: item as "" | null,
          },
        },
        empty: (key, value, scope, translations) => {
          reported = true;
          assert.equal(scope, "some.scope");
          assert.equal(key, "base.some_key");
          assert.equal(value, item);
          assert.equal(typeof translations, "object");
          return undefined;
        },
      });

      const value = i18n.translate("base.some_key");
      assert.equal(reported, true);
      assert.equal(value, "some key");
    }),
  );

  it("reports missing keys for arrays", () => {
    let reported = false;
    const i18n = new I18n({
      $scope: "some.scope",
      missing: (key, scope, translations) => {
        reported = true;
        assert.equal(scope, "some.scope");
        assert.equal(key, "a.missing.key, another.missing.key");
        assert.equal(typeof translations, "object");
        assert.equal(Object.keys(translations ?? {}).length, 0);
        return undefined;
      },
    });

    i18n.translate(["a.missing.key", "another.missing.key"]);
    assert.equal(reported, true);
  });

  it("does not report missing key when one of the keys was found", () => {
    let reported = false;
    const i18n = new I18n({
      $scope: "some.scope",
      missing: () => {
        reported = true;
        return undefined;
      },
      translations: {
        fallback: "falling back",
      },
    });

    const translation = i18n.translate(["a.missing.key", "fallback"]);
    assert.equal(reported, false);
    assert.equal(translation, "falling back");
  });

  it('reports missing keys using "onmiss"', () => {
    const i18n = new I18n({ $scope: "some.scope" });

    i18n.onmiss((key, scope, translations) => {
      assert.equal(scope, "some.scope");
      assert.equal(key, "a.missing.key");
      assert.equal(typeof translations, "object");
      assert.equal(Object.keys(translations ?? {}).length, 0);
      return undefined;
    });

    i18n.translate("a.missing.key");
  });
});
