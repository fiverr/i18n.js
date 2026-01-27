import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { I18n } from "../src/index.ts";
import translations from "./translations-stub.json" with { type: "json" };

describe("child instances", () => {
  const i18n = new I18n({ translations });
  const child = i18n.spawn("controller_name.action_name");

  it("Can spawn a child with no scope", () => {
    const orphan = i18n.spawn();
    assert.equal(orphan.t("root.user.name"), "Martin");
  });

  it("Child finds namespaced translations", () => {
    assert.equal(child.t("i.am.in.scope"), "I am in scope");
  });

  it("Parent does not find namespaced translations", () => {
    assert.equal(i18n.t("i.am.in.scope"), "scope");
  });

  it("Child finds top level translations", () => {
    assert.equal(child.t("root.user.name"), "Martin");
  });

  it("Child adds translations to the parent's store under a namespace", () => {
    child.add({ nonsense: { words: "Non sense words" } });
    child.add({ introduction: "Hi, my name is %{username}" });

    assert.equal(
      child.t("introduction", { username: "Martin" }),
      "Hi, my name is Martin",
    );
    assert.equal(
      i18n.t("controller_name.action_name.introduction", {
        username: "Martin",
      }),
      "Hi, my name is Martin",
    );
  });

  it("Child's $scope is an approachable attribute", () => {
    child.$scope = "another_controller_name.action_name";
    assert.equal(child.t("i.am.in.scope"), "I am in a different scope");
  });

  it("Child's scope in nested under parent's scope (when applicable)", () => {
    const scoped = new I18n({ translations, $scope: "en" });
    const scopedChild = scoped.spawn("page");

    assert.equal(scoped.t("title"), "My App");
    assert.equal(scopedChild.t("title"), "My Page");
  });

  it("Child should check its own scope before parent", () => {
    const local = new I18n({
      translations: {
        key: "Top",
        child: { key: "Child" },
        something: { key: "Something" },
      },
    });
    const localChild = local.spawn("child");

    assert.equal(local.t("key", { $scope: "something" }), "Something");
    assert.equal(localChild.t("key"), "Child");
    assert.equal(localChild.t("key", { $scope: "something" }), "Something");
  });

  it("Child calls parent onmiss functionallity", () => {
    const local = new I18n({ translations });
    let miss = 0;
    local.onmiss(() => {
      miss++;
      return "";
    });
    const localChild = local.spawn("child");
    localChild.t("missing_translation");
    assert.equal(miss, 1);
  });

  it("Child overrides parent onmiss functionallity", () => {
    const local = new I18n({ translations });
    let miss = 0;
    let childMiss = 0;
    local.onmiss(() => {
      miss++;
      return "";
    });
    const localChild = local.spawn("child");
    localChild.onmiss(() => {
      childMiss++;
      return "";
    });

    localChild.t("missing_translation");
    assert.equal(miss, 0);
    assert.equal(childMiss, 1);
  });
});
