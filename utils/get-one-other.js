const has = require('./has');

/**
 * get "one" or "other" from translation key item
 * @param  {Any} result
 * @param  {Object} data
 * @return {String}
 */
module.exports = function getOneOther(result, data) {
    if (isOneOther(result, data)) {
        return Number(data.count) === 1 ? result.one : result.other;
    }

    return result;
};

/**
 * Check conditions for a one/other use case
 * @param  {Object|Any} result
 * @param  {Object|Any} data
 * @return {Boolean} The conditions meet a one/other use case
 */
const isOneOther = (result, data) =>
    typeof result === 'object' &&
    typeof data === 'object' &&
    has(result, 'one') &&
    has(result, 'other') &&
    has(data, 'count');
