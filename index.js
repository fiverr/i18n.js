/**
 * @module i18n
 * @since 1.0.0
 */

const resolve = require('@fiverr/futile/lib/resolve');
const interpolate = require('@fiverr/futile/lib/interpolate');
const deepassign = require('@fiverr/futile/lib/deepassign');
const freeze = require('deep-freeze');
const getOneOther = require('./utils/get-one-other');
const jsonclone = require('./utils/jsonclone');

const TRANSLATIONS = typeof Symbol === 'function' ? Symbol() : '_translations';
const MISSING = typeof Symbol === 'function' ? Symbol() : '_missing';

/**
 * @class I18n
 * @classdesc an object capable of translating keys and interpolate using given data object
 * @param {Object}   options.translations JSON compliant object
 * @param {String}   [options.$scope]     Root string to be use for looking for translation keys
 * @param {Function} [options.missing]    Method to call when key is not found
 */
module.exports = class I18n {
    constructor({translations, $scope, missing} = {translations: {}, $scope: undefined, missing: undefined}) {
        this[TRANSLATIONS] = freeze(jsonclone(translations));
        this[MISSING] = missing || (() => {});
        this.$scope = $scope;

        this.translate = this.translate.bind(this);
    }

    /**
     @static getDefault
     * @param  {String} key
     * @return {String} A default string for a missing key
     */
    static getDefault(key = '') {
        return key.split('.').pop().replace(/_/g, ' ');
    }

    /**
     * translations
     * @return {Object} instance translations object
     */
    get translations() {
        return this[TRANSLATIONS];
    }

    /**
     * Add translation object(s)
     * @param {[type]} translations [description]
     * @return {self}
     */
    add(...args) {
        args.unshift({}, this.translations);
        this[TRANSLATIONS] = freeze(deepassign(...args));

        return this;
    }

    /**
     * translate
     * @param  {String} key    String representing dot notation
     * @param  {Object} [data] Interpolation data
     * @return {String} translated and interpolated
     */
    translate(key, data) {
        let result = this.find(...[data, this].reduce((alternatives, item) => {
            const base = resolve('$scope', item);

            if (base !== undefined) {
                alternatives.push([base, key].join('.'));
            }

            return alternatives;
        }, [key]));

        // Handle one,other translation structure
        result = getOneOther(result, data);

        switch (typeof result) {
            case 'object':
            case 'number':
            case 'boolean':
                return result;
            case 'string':
                if (result) {
                    return interpolate(result, data);
                }
                break;
            default:
                this[MISSING](key, this.$scope, this.translations);
                return I18n.getDefault(key);
        }
    }

    /**
     * find
     * @param  {...[String]} alternatives Different alternatives of strings to find
     * @return {Any} Found match on translations object
     */
    find(...alternatives) {
        const key = alternatives.shift();
        const result = resolve(key, this.translations);
        const done = typeof result !== 'undefined' || alternatives.length === 0;

        return done ? result : this.find(...alternatives);
    }
};
