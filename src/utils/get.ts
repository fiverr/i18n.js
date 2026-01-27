import { isNonNullObject } from "./isNonNullObject.ts";

export const get = (obj: Record<string, unknown>, key: string): unknown =>
  key
    .split(".")
    .reduce(
      (current, part) =>
        isNonNullObject(current)
          ? (current as Record<string, unknown>)[part]
          : undefined,
      obj as unknown,
    );
