import type { TranslationValue, InterpolationData } from "../index.ts";
import { isNonNullObject } from "./isNonNullObject.ts";

interface OneOtherResult {
  one: TranslationValue;
  other: TranslationValue;
}

/**
 * Check conditions for a one/other use case
 */
const isOneOther = (
  result: unknown,
  data?: InterpolationData,
): result is OneOtherResult =>
  isNonNullObject(result) &&
  isNonNullObject(data) &&
  Object.hasOwn(result, "one") &&
  Object.hasOwn(result, "other") &&
  Object.hasOwn(data, "count");

/**
 * get "one" or "other" from translation key item
 */
export const getOneOther = (
  result: TranslationValue,
  data?: InterpolationData,
): TranslationValue =>
  isOneOther(result, data)
    ? Number(data?.count) === 1
      ? result.one
      : result.other
    : result;
