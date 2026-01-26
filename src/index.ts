import { paraphrase } from "paraphrase";
import { assign } from "@recursive/assign";
import { freeze } from "./utils/freeze.ts";
import { _global } from "./utils/glob.ts";
import { getOneOther } from "./utils/getOneOther.ts";
import { jsonclone } from "./utils/jsonclone.ts";
import { get } from "./utils/get.ts";

const TRANSLATIONS = Symbol();
const MISSING = Symbol();
const EMPTY = Symbol();
const EMPTY_VALUES = [null, ""];
const ACCEPTABLE_RETURN_TYPES = ["object", "number", "boolean", "string"];

const interpolate = paraphrase(
  /\${([^{}]*)}/g,
  /%{([^{}]*)}/g,
  /{{([^{}]*)}}/g,
);

// Type definitions
export type TranslationValue =
  | string
  | number
  | boolean
  | Record<string, unknown>
  | undefined;

export interface TranslationsObject {
  [key: string]: TranslationValue | TranslationsObject;
}

export type MissingCallback = (
  key: string,
  scope?: string,
  translations?: TranslationsObject,
) => string | undefined;

export type EmptyCallback = (
  key: string,
  value: null | "",
  scope?: string,
  translations?: TranslationsObject,
) => string | undefined;

export interface InterpolationData {
  $scope?: string;
  [key: string]: unknown;
}

export interface I18nOptions {
  translations?: TranslationsObject;
  $scope?: string;
  missing?: MissingCallback;
  empty?: EmptyCallback;
}

/**
 * @class I18n
 * @classdesc an object capable of translating keys and interpolate using given data object
 * @param {Object}   options.translations JSON compliant object
 * @param {String}   [options.$scope]     Root string to be use for looking for translation keys
 * @param {Function} [options.missing]    Method to call when key is not found
 * @param {Function} [options.empty]      Method to call when value is empty
 */
class I18n {
  [TRANSLATIONS]: TranslationsObject;
  [MISSING]: MissingCallback;
  [EMPTY]: EmptyCallback;
  $scope?: string;

  [key: symbol]: any;

  constructor(
    { translations = {}, $scope, missing, empty }: I18nOptions = {
      translations: {},
    },
  ) {
    this[TRANSLATIONS] = freeze(jsonclone(translations));
    this[MISSING] = () => undefined;
    this[EMPTY] = () => undefined;
    this.onmiss(missing);
    this.onempty(empty);
    this.$scope = $scope;

    this.translate = this.translate.bind(this);
  }

  /**
     @static getDefault
     * @param  {String} key
     * @return {String} A default string for a missing key
     */
  static getDefault(key: string | string[]): string {
    return ((Array.isArray(key) ? key[0] : key) || "")
      .split(".")
      .pop()!
      .replace(/_/g, " ");
  }

  /**
   * translations
   * @return {Object} instance translations object
   */
  get translations(): TranslationsObject {
    return this[TRANSLATIONS];
  }

  /**
   * t alias to translate
   * @return {Function}
   */
  get t(): (
    key?: string | string[],
    data?: InterpolationData,
  ) => string | TranslationValue {
    return this.translate;
  }

  /**
   * Add translation object(s)
   * @param {Object(s)} translations [description]
   * @return {self}
   */
  add(...args: [TranslationsObject, ...TranslationsObject[]]): this {
    args.unshift({}, this.translations);
    this[TRANSLATIONS] = freeze(assign(...args));

    return this;
  }

  /**
   * translate
   * @param  {String} key    String representing dot notation
   * @param  {Object} [data] Interpolation data
   * @return {String} translated and interpolated
   */
  translate(
    key?: string | string[],
    data?: InterpolationData,
  ): string | TranslationValue {
    const keys = Array.isArray(key) ? key : [key];

    // Create key alternatives with prefixes
    const alternatives = ([] as string[]).concat(
      ...keys.map((key) => this.alternatives(key, data)),
    );

    // Find the first match
    let result: TranslationValue = this.find(...alternatives);

    // Handle one,other translation structure
    result = getOneOther(result, data);

    if (EMPTY_VALUES.includes(result as null | "")) {
      return (
        this[EMPTY](
          `${keys.join(", ")}`,
          result as null | "",
          this.$scope,
          this.translations,
        ) || I18n.getDefault(keys.filter((k): k is string => k !== undefined))
      );
    }

    const type = typeof result;
    result = type === "string" ? interpolate(result as string, data) : result;

    return ACCEPTABLE_RETURN_TYPES.includes(type)
      ? result
      : this[MISSING](`${keys.join(", ")}`, this.$scope, this.translations) ||
          I18n.getDefault(keys.filter((k): k is string => k !== undefined));
  }

  /**
   * Check if a translation key exists
   * @param  {string|string[]} keys
   * @param  {Object}          data
   * @return {Boolean}      [description]
   */
  has(keys?: string | string[] | null, data?: InterpolationData): boolean {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    const alternatives = keyArray.reduce(
      (accumulator: (string | undefined | null)[], key) =>
        accumulator.concat(this.alternatives(key, data)),
      [] as (string | undefined | null)[],
    );

    const result = this.find(...alternatives);
    return (
      typeof result !== "undefined" &&
      !EMPTY_VALUES.includes(result as null | "")
    );
  }

  /**
   * Create key alternatives with prefixes according to instance scopes
   * @param  {string}   key
   * @param  {object}   data Object optionally containing '$scope' parameter
   * @return {string[]}
   */
  alternatives(key?: string | null, data?: InterpolationData): string[] {
    return [data || {}, this]
      .map(({ $scope }) => $scope)
      .filter(Boolean)
      .map((scope) => [scope, key].join("."))
      .concat(key ?? "");
  }

  /**
   * find
   * @param  {...[String]} alternatives Different alternatives of strings to find
   * @return {Any} Found match on translations object
   */
  find(...alternatives: (string | undefined | null)[]): TranslationValue {
    const key = alternatives.shift();
    if (!key) return undefined;

    const result = get(this.translations as Record<string, unknown>, key);
    const done = typeof result !== "undefined" || alternatives.length === 0;

    return done ? (result as TranslationValue) : this.find(...alternatives);
  }

  /**
   * Register callback to be called when a translation was missing.
   * Function accepts arguments: {String} missing key
   *                             {String} translation scope
   *                             {Object} The entire translation dictionary
   * @param  {Function} callback
   * @return {self}
   *
   * @example
   * i18n.onmiss((key) => logMissingKeyEvent({key})
   */
  onmiss(callback?: MissingCallback): this {
    if (typeof callback === "function") {
      this[MISSING] = callback;
    }
    return this;
  }

  /**
   * Register callback to be called when a translation value is empty.
   * Function accepts arguments: {String} missing key
   *                             {String} translation scope
   *                             {Object} The entire translation dictionary
   * @param  {Function} callback
   * @return {self}
   *
   * @example
   * i18n.onempty((key, value) => logEmptyValueEvent({key, value})
   */
  onempty(callback?: EmptyCallback): this {
    if (typeof callback === "function") {
      this[EMPTY] = callback;
    }
    return this;
  }

  /**
   * Spawns a scoped child
   * @param  {String}    scope Namespace
   * @return {I18nChild}       I18nChild instance
   */
  spawn(scope?: string): I18nChild {
    return new I18nChild(this, scope);
  }

  /**
   * Make sure you only have one instance of I18n in your global scope
   * @return {I18n} the same instance every time
   *
   * @example
   * const i18n = I18n.singleton;
   */
  static get singleton(): I18n {
    if ((_global as any)?.i18n) {
      return (_global as any).i18n;
    }

    const i18n = new I18n();

    try {
      Object.defineProperty(_global, "i18n", {
        value: i18n,
        writable: false,
        enumerable: false,
        configurable: false,
      });
    } catch (e) {
      (_global as any).i18n = i18n;
    }

    return i18n;
  }
}

/**
 * @class I18nChild
 * @extends I18n
 * @classdesc A child with the same capabilities and access but which translation keys may be namespcaed
 * @param  {String} [$scope]
 */
class I18nChild extends I18n {
  parent: I18n;

  constructor(parent: I18n, $scope?: string) {
    super();
    const scopeChain: string[] = [];

    parent.$scope && scopeChain.push(parent.$scope);
    $scope && scopeChain.push($scope);

    this.$scope = scopeChain.join(".") || undefined;
    this.parent = parent;
    this[MISSING] = this.parent[MISSING];
    this[EMPTY] = this.parent[EMPTY];
  }

  /**
   * translations
   * @return {Object} parent's translations object
   */
  get translations(): TranslationsObject {
    return this.parent.translations;
  }

  /**
   * Passes the translations to the parent's store under the namespace
   * @param {...Object} args Translation objects
   */
  add(...args: [TranslationsObject, ...TranslationsObject[]]): this {
    if (this.$scope) {
      const scope = this.$scope;
      this.parent.add(
        ...(args.map((arg) => {
          const base: Record<string, unknown> = {};

          scope
            .split(".")
            .reduce(
              (
                base: Record<string, unknown>,
                item: string,
                index: number,
                array: string[],
              ) => {
                base[item] = index === array.length - 1 ? arg : {};

                return base[item] as Record<string, unknown>;
              },
              base,
            );

          return base;
        }) as [TranslationsObject, ...TranslationsObject[]]),
      );
    } else {
      this.parent.add(...args);
    }

    return this;
  }
}

/**
 * Shortcut to an empty I18n instance
 * @type {I18n}
 */
const instance = new I18n();

/**
 * Shortcut to I18n's singleton
 * @type {I18n}
 */
const singleton = I18n.singleton;

export { I18n, instance, singleton };
