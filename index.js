/**
 * @module i18n
 * @since 1.0.0
 */

const resolve = require('@fiverr/futile/lib/resolve');
const interpolate = require('@fiverr/futile/lib/interpolate');
const deepassign = require('@fiverr/futile/lib/deepassign');
const _global = require('@fiverr/futile/lib/global');
const freeze = require('deep-freeze');
const getOneOther = require('./utils/get-one-other');
const jsonclone = require('./utils/jsonclone');

const TRANSLATIONS = typeof Symbol === 'function' ? Symbol() : '_translations';
const MISSING = typeof Symbol === 'function' ? Symbol() : '_missing';
const MEMORY = typeof Symbol === 'function' ? Symbol() : '_memory';

/**
 * @class I18n
 * @classdesc an object capable of translating keys and interpolate using given data object
 * @param {Object<Object>}   options.translations JSON compliant object
 * @param {Object<String>}   [options.$scope]     Root string to be use for looking for translation keys
 * @param {Object<Function>} [options.missing]    Method to call when key is not found
 */
class I18n {
    constructor({translations, $scope, missing} = {translations: {}, $scope: undefined, missing: undefined}) {
        this[TRANSLATIONS] = freeze(jsonclone(translations));
        this[MISSING] = [];
        this[MEMORY] = {};
        this.onmiss(missing);
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
     * t alias to translate
     * @return {Function}
     */
    get t() {
        return this.translate;
    }

    /**
     * Add translation object(s)
     * @param {Object(s)} translations [description]
     * @return {self}
     */
    add(...args) {
        this[MEMORY] = {}; // clear key lookup memory

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
                this[MISSING].forEach(fn => fn(key, this.$scope, this.translations));
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
        const result = this.resolve(key);
        const done = typeof result !== 'undefined' || alternatives.length === 0;

        return done ? result : this.find(...alternatives);
    }

    /**
     * Perform key lookup on the translation object and memoise the value
     * @param  {String} key
     * @return {Any}
     */
    resolve(key) {
        return this[MEMORY][key] = this[MEMORY].hasOwnProperty(key) ? this[MEMORY][key] : resolve(key, this.translations);
    }

    /**
     * Register callback to be called when a translation was missing.
     * Function accepts arguments: {String} missing key
     *                             {String} translation scope
     *                             {Object} The entire translation dictionary
     * @param  {Function} callback
     * @return {self}
     *
     * @example
     * i18n.onmiss((key) => logMissingKeyEvent({key: key.replace(/\W/g, '_'), })
     */
    onmiss(callback) {
        typeof callback === 'function' && this[MISSING].push(callback);
        return this;
    }

    /**
     * Spawns a scoped child
     * @param  {String}    scope Namespace
     * @return {I18nChild}       I18nChild instance
     */
    spawn(scope) {
        return new I18nChild(this, scope);
    }

    /**
     * Make sure you only have one instance of I18n in your global scope
     * @return {I18n} the same instance every time
     *
     * @example
     * const i18n = I18n.singleton;
     */
    static get singleton() {
        if (_global.i18n) {
            return _global.i18n;
        }

        const i18n = new I18n();

        try {
            Object.defineProperty(_global, 'i18n', {
                value: i18n,
                writable: false,
                enumerable: false,
                configurable: false
            });
        } catch (e) {
            _global.i18n = i18n;
        }

        return i18n;
    }
}

/**
 * @class I18nChild
 * @extends I18n
 * @classdesc A child with the same capabilities and access but which translation keys may be namespcaed
 * @param  {String} [$scope]
 */
class I18nChild extends I18n {
    constructor(parent, $scope) {
        super();
        const scopeChain = [];

        parent.$scope && scopeChain.push(parent.$scope);
        $scope && scopeChain.push($scope);

        this.$scope = scopeChain.join('.') || undefined;
        this.parent = parent;
    }

    /**
     * translations
     * @return {Object} parent's translations object
     */
    get translations() {
        return this.parent.translations;
    }

    /**
     * Passes the translations to the parent's store under the namespace
     * @param {...Object} args Translation objects
     */
    add(...args) {
        if (this.$scope) {
            this.parent.add(...args.map((arg) => {
                const base = {};

                this.$scope.split('.').reduce((base, item, index, array) => {
                    base[item] = index === array.length - 1 ? arg : {};

                    return base[item];
                }, base);

                return base;
            }));
        } else {
            this.parent.add(...args);
        }

        return this;
    }
}

module.exports = I18n;
