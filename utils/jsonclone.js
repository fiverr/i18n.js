/**
 * Return a clone for JSON complaint objects, an empty object otherwise
 * @param  {Object} object
 * @return {Object}
 */
module.exports = function jsonclone(object) {
    try {
        return JSON.parse(JSON.stringify(object));
    } catch (e) {
        return {};
    }
};
