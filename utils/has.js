
/**
 * Use Object prototype's hasOwnProperty directly
 * @param  {Object} target
 * @param  {String} property
 * @return {Boolean}
 */
const has = (target, property) => Object.prototype.hasOwnProperty.call(target, property);

module.exports = has;
