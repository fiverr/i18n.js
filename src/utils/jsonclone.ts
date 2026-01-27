/**
 * Return a clone for JSON complaint objects, an empty object otherwise
 * @param  {Object} object
 * @return {Object}
 */
export function jsonclone<T = Record<string, unknown>>(
  object: T,
): T | Record<string, never> {
  try {
    return JSON.parse(JSON.stringify(object));
  } catch (e) {
    return {};
  }
}
