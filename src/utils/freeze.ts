import { isNonNullObject } from "./isNonNullObject.ts";

/**
 * Deeply freezes an object, making it immutable
 */
export function freeze<T>(obj: T): T {
  if (!isNonNullObject(obj)) return obj;

  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const value = (obj as any)[prop];
    if (isNonNullObject(value) && !Object.isFrozen(value)) {
      (obj as any)[prop] = freeze(value);
    }
  });

  return Object.freeze(obj);
}
