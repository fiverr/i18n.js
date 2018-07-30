module.exports = (typeof global === 'object' && global.global === global && global) || // eslint-disable-line no-undef
    (typeof window === 'object' && window.window === window && window);
