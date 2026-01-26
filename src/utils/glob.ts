declare const global: {
  global?: typeof global;
};

declare const window: {
  window?: typeof window;
};

export const _global:
  | typeof global
  | typeof window
  | typeof globalThis
  | undefined =
  (typeof global === "object" && global.global === global && global) || // eslint-disable-line no-undef
  (typeof window === "object" && window.window === window && window) ||
  undefined;
