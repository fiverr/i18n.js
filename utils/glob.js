const glob = (typeof global === 'object' && global.global === global && global) ||
    (typeof window === 'object' && window.window === window && window);

module.exports = {
    glob
};
