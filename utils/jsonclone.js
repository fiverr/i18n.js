/**
 * Return a clone for JSON complaint objects, an empty object otherwise
 * @param  {Object} object
 * @return {Object}
 */
const jsonclone = (object) => {
    try {
        return JSON.parse(JSON.stringify(object));
    } catch (e) {
        return {};
    }
};

module.exports = {
    jsonclone
};
