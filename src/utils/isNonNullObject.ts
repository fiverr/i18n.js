/**
 * Checks if a value is a non-null object
 */
export const isNonNullObject = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
