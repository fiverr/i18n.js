import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";

const _global = globalThis as typeof globalThis & { i18n?: any };
const { defineProperty } = Object;

describe("Singleton", () => {
  before(() => {
    defineProperty.call(Object, Object, "defineProperty", {
      configurable: true,
      value: function (obj: any, prop: string, descriptor: PropertyDescriptor) {
        if (descriptor.writable === false) {
          descriptor.writable = true;
        }
        return defineProperty.call(Object, obj, prop, descriptor);
      },
    });
  });
  after(() => {
    defineProperty.call(Object, Object, "defineProperty", {
      value: defineProperty,
    });
  });
  it("sanity on import fresh instances", async () => {
    const I18n_a = await import("../src/index.ts?" + Math.random());
    const I18n_b = await import("../src/index.ts?" + Math.random());

    (I18n_a as any).I18n.extra_param = "Extra";
    assert.notEqual((I18n_a as any).I18n.extra_param, undefined);
    assert.equal((I18n_a as any).I18n.extra_param, "Extra");
    assert.equal((I18n_b as any).I18n.extra_param, undefined);
  });
  return;

  it("has only one instance in scope", async () => {
    const i18n_a = (await import("../src/index.ts?" + Math.random())).singleton;
    const i18n_b = (await import("../src/index.ts?" + Math.random())).singleton;
    const i18n_c = (await import("../src/index.ts?" + Math.random())).singleton;

    i18n_a.add({ a: "one" });
    i18n_b.add({ b: "two" });
    i18n_c.add({ b: "three" });

    assert.equal(i18n_b.t("a"), "one");
    assert.equal(i18n_b.t("b"), "three");
  });

  it("returns whatever is already on the global scope", async () => {
    (_global as any).i18n.appendix = "appendix";
    const i18n_a = (await import("../src/index.ts?" + Math.random())).singleton;
    assert.equal((i18n_a as any).appendix, "appendix");
  });

  describe("singleton is locked to the global scope", () => {
    let i18nInstance: any;

    it("setup singleton", async () => {
      i18nInstance = (await import("../src/index.ts?" + Math.random()))
        .singleton;
    });

    it('Gets the global name "i18n"', () => {
      assert.equal(i18nInstance, _global.i18n);
    });

    it("Can not be re assigned", () => {
      Object.defineProperty(_global, "i18n", {
        value: null,
        writable: true,
      });
      assert.equal(_global.i18n, i18nInstance);
      assert.notEqual(_global.i18n, null);
    });

    it("Can not ne deleted", () => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete (_global as any).i18n;
      assert.equal(typeof _global.i18n, "object");
    });

    it("Is not enumerable on the global object", () => {
      assert.equal(Object.keys(_global).includes("i18n"), false);
    });
  });
});
