import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { I18n, type InterpolationData } from "../src/index.ts";
import translations from "./translations-stub.json" with { type: "json" };

const $scope = "controller_name.action_name";

describe("I18n", () => {
  const i18n = new I18n({ translations, $scope });

  it("object initiates correctly", () => {
    assert.deepEqual(translations, translations);
    assert.equal(i18n.$scope, $scope);
  });

  it("can initiate w/o options", () => {
    assert.doesNotThrow(() => new I18n());
  });

  it("instance translations cannot be set", () => {
    const newTranslations = { a: 1 };
    try {
      (i18n as any).translations = newTranslations;
    } catch (e) {
      // ignore
    }
    assert.notDeepEqual(i18n.translations, newTranslations);
    assert.deepEqual(i18n.translations, translations);
  });

  it("instance translations are immutable", () => {
    try {
      (i18n.translations as Record<string, unknown>).add_key = "Added key";
    } catch (e) {
      // ignore
    }
    assert.equal("add_key" in i18n.translations, false);

    try {
      (i18n.translations as { root?: Record<string, unknown> }).root!.add_key =
        "Added key";
    } catch (e) {
      // ignore
    }
    assert.equal(
      "add_key" in
        (i18n.translations as { root?: Record<string, unknown> }).root!,
      false,
    );

    i18n.add({
      something: { is: { an: "object" } },
    });

    try {
      (
        i18n.translations as { something?: Record<string, unknown> }
      ).something!.add_key = "Added key";
    } catch (e) {
      // ignore
    }
    assert.equal(
      typeof (i18n.translations as { something?: Record<string, unknown> })
        .something,
      "object",
    );
    assert.equal(
      "add_key" in
        (i18n.translations as { something?: Record<string, unknown> })
          .something!,
      false,
    );
  });

  it("adding assigns only relevant endpoints", () => {
    i18n.add({ new: { item: { a: "A!", b: "B!" } } });

    assert.equal(i18n.translate("new.item.a"), "A!");
    assert.equal(i18n.translate("new.item.b"), "B!");

    i18n.add({ new: { item: { b: "BEE!" } } });

    assert.equal(i18n.translate("new.item.a"), "A!");
    assert.equal(i18n.translate("new.item.b"), "BEE!");
  });

  it("i18n translates keys", () => {
    assert.equal(i18n.translate("root.user.name"), "Martin");
  });

  it("i18n uses keys list to find an existing key", () => {
    assert.equal(
      i18n.translate(["root_user_name", "root.user.name"]),
      "Martin",
    );
  });

  it("translate function is bound to instance", () => {
    const translate = i18n.translate;

    assert.equal(translate("root.user.name"), "Martin");

    const t = i18n.t;

    assert.equal(t("root.user.name"), "Martin");
  });

  it("i18n t aliases translate", () => {
    assert.equal(i18n.t, i18n.translate);
    assert.equal(i18n.t("root.user.name"), "Martin");
  });

  it("interpolates values", () => {
    assert.equal(
      i18n.translate("root.interpolated.phrase", {
        item: "a thing",
        another: "a different thing",
      }),
      "Please replace a thing with a thing and a different thing thing",
    );
  });

  it("i18n returns default value", () => {
    assert.equal(I18n.getDefault("root.user.age"), "age");
    assert.equal(i18n.translate("root.user.age"), "age");
  });

  it("one other", () => {
    assert.equal(typeof i18n.translate("root.wait"), "object");
    assert.equal(i18n.translate("root.wait", { count: 1 }), "Wait one day");
    assert.equal(i18n.translate("root.wait", { count: 2 }), "Wait 2 days");
    assert.equal(
      i18n.translate("root.wait", { count: "two" }),
      "Wait two days",
    );
  });

  it("more types", () => {
    assert.equal(typeof i18n.translate("root.is.a.number"), "number");
    assert.equal(typeof i18n.translate("root.is.a.boolean"), "boolean");
    assert.equal(typeof i18n.translate("root.is.a.object"), "object");
  });

  it("add translations - value type: object", () => {
    assert.equal(i18n.translate("just.another.missing_key"), "missing key");
    i18n.add({ just: { another: { missing_key: "different value" } } });
    assert.equal(i18n.translate("just.another.missing_key"), "different value");
    i18n.add({ yet: { another: { key: "I exist, too" } } });
    assert.equal(i18n.translate("yet.another.key"), "I exist, too");
  });

  it("add translations - value type: array", () => {
    assert.equal(
      i18n.translate("just.another.missing_key_for_array"),
      "missing key for array",
    );
    i18n.add({ just: { another: { missing_key_for_array: ["a", "b"] } } });
    assert.deepEqual(i18n.translate("just.another.missing_key_for_array"), [
      "a",
      "b",
    ]);
    i18n.add({
      just: { another: { missing_key_for_array: ["a", "b", "c"] } },
    });
    assert.deepEqual(i18n.translate("just.another.missing_key_for_array"), [
      "a",
      "b",
      "c",
    ]);
  });

  it("finds translations in scope", () => {
    assert.equal(
      i18n.translate("controller_name.action_name.i.am.in.scope"),
      "I am in scope",
    );

    assert.equal(i18n.translate("i.am.in.scope"), "I am in scope");
  });

  it("passed in scope (prefered over pre set scope)", () => {
    assert.equal(
      i18n.translate(`${i18n.$scope}.i.am.in.scope`),
      "I am in scope",
    );

    assert.equal(
      i18n.translate("i.am.in.scope", {
        $scope: "another_controller_name.action_name",
      }),
      "I am in a different scope",
    );
  });

  it("keys arrays performs lookup in scope", () => {
    assert.equal(
      i18n.translate(["i.am.not.found", "i.am.in.scope"], {
        $scope: "another_controller_name.action_name",
      }),
      "I am in a different scope",
    );
  });

  it("prefers contextual string to non contextual (found in scope)", () => {
    const more = {
      i: {
        am: {
          in: {
            scope: "and now for something completely different",
          },
        },
      },
    } as const;
    i18n.add(more);

    assert.equal(i18n.translate("i.am.in.scope"), "I am in scope");
  });

  it("searches for available keys", () => {
    const local = new I18n();

    local.add({
      lookup: { key: "balue", biscuit: "" },
    });

    const truthyCases: Array<[string | string[], InterpolationData?]> = [
      ["lookup.key"],
      [["lookup.pie", "lookup.key"]],
      ["key", { $scope: "lookup" }],
      [["pie", "key"], { $scope: "lookup" }],
    ];

    truthyCases.forEach((args) =>
      assert.equal(local.has(...args), true, String(args)),
    );

    const falsyCases: Array<[string | string[] | null]> = [
      ["lookup.pie"],
      [["lookup.pie", "lookup.cake"]],
      ["key"],
      [] as any,
      [null],
    ];

    falsyCases.forEach((args) =>
      assert.equal(local.has(...args), false, String(args)),
    );

    const child = local.spawn("lookup");

    assert.equal(child.has("key"), true, "child.key");
    assert.equal(child.has("biscuit"), false, "child.biscuit");
    assert.equal(child.has("pie"), false, "child.pie");
  });
});
