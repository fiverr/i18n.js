/**
 * @module i18n
 * @since 1.0.0
 */

const { get } = require('lodash');
const paraphrase = require('paraphrase');
const assign = require('@recursive/assign');
const freeze = require('deep-freeze');
const _global = require('./utils/glob');
const getOneOther = require('./utils/get-one-other');
const jsonclone = require('./utils/jsonclone');
const { isTemplateInjectionEligible, injectTemplates } = require('./utils/templates');

const TRANSLATIONS = typeof Symbol === 'function' ? Symbol() : '_translations';
const MISSING = typeof Symbol === 'function' ? Symbol() : '_missing';
const EMPTY = typeof Symbol === 'function' ? Symbol() : '_empty';
const EMPTY_VALUES = [null, ''];
const ACCEPTABLE_RETURN_TYPES = ['object', 'number', 'boolean', 'string'];
const TEMPLATE_INJECTION_ERROR = typeof Symbol === 'function' ? Symbol() : '_template_injection_error';

const interpolate = paraphrase(/\${([^{}]*)}/g, /%{([^{}]*)}/g, /{{([^{}]*)}}/g);

/**
 * @class I18n
 * @classdesc an object capable of translating keys and interpolate using given data object
 * @param {Object}   options.translations JSON compliant object
 * @param {String}   [options.$scope]     Root string to be use for looking for translation keys
 * @param {Function} [options.missing]    Method to call when key is not found
 * @param {Function} [options.empty]      Method to call when value is empty
 * @param {Function} [options.templateInjectionError]      Method to call when error with template
 */
class I18n {
    constructor({
        translations = {},
        $scope,
        missing,
        empty,
        templateInjectionError
    } = { translations: {} }) {
        this[TRANSLATIONS] = freeze(jsonclone(translations));
        this[MISSING] = () => undefined;
        this[EMPTY] = () => undefined;
        this[TEMPLATE_INJECTION_ERROR] = () => undefined;

        this.onmiss(missing);
        this.onempty(empty);
        this.onTemplateInjectionError(templateInjectionError);

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
        args.unshift({}, this.translations);
        this[TRANSLATIONS] = freeze(assign(...args));

        return this;
    }

    /**
     * translate
     * @param  {String} key    String representing dot notation
     * @param  {Object} [data] Interpolation data
     * @return {String} translated and interpolated
     */
    translate(key, data = {}) {
        const { templates, templatesTransformer, ...params } = data;

        const keys = Array.isArray(key) ? key : [ key ];

        // Create key alternatives with prefixes
        const alternatives = [].concat(
            ...keys.map(
                (key) => this.alternatives(key, params)
            )
        );

        // Find the first match
        let result = this.find(...alternatives);

        // Handle one,other translation structure
        result = getOneOther(result, params);

        if (EMPTY_VALUES.includes(result)) {
            return this[EMPTY](
                `${key}`, result, this.$scope, this.translations
            ) || I18n.getDefault(...keys);
        }

        const type = typeof result;
        result = type === 'string' ? interpolate(result, params) : result;

        if (ACCEPTABLE_RETURN_TYPES.includes(type)) {
            if (isTemplateInjectionEligible(result)) {
                return this.handleTemplateInjection(key, result, templates, templatesTransformer);
            }

            return result;
        }

        return this[MISSING](`${key}`, this.$scope, this.translations) || I18n.getDefault(...keys);
    }

    /**
     * Inject all templates into the origin translation.
     *
     * @param {String} key String representing dot notation
     * @param {String} originTranslation The translation into which the templates will be injected.
     * @param {Record.<String, Function>} templates The templates that will be injected.
     * @param {Record.<String, Function>} templatesTransformer The templates transformer function
     * @return {String} template injected translation
     */
    handleTemplateInjection(key, originTranslation, templates, templatesTransformer) {
        try {
            return injectTemplates({
                originTranslation,
                templates,
                templatesTransformer
            });
        } catch (error) {
            return this[TEMPLATE_INJECTION_ERROR](
                `${key}`, this.$scope, error.message
            );
        }
    }

    /**
     * Check if a translation key exists
     * @param  {string|string[]} keys
     * @param  {Object}          data
     * @return {Boolean}      [description]
     */
    has(keys, data) {
        keys = Array.isArray(keys) ? keys : [ keys ];
        const alternatives = keys.reduce(
            (accumulator, key) => accumulator.concat(this.alternatives(key, data)),
            []
        );

        const result = this.find(...alternatives);
        return typeof result !== 'undefined' && !EMPTY_VALUES.includes(result);
    }

    /**
     * Create key alternatives with prefixes according to instance scopes
     * @param  {string}   key
     * @param  {object}   data Object optionally containing '$scope' parameter
     * @return {string[]}
     */
    alternatives(key, data= {}) {
        return [data, this].map(
            ({ $scope }) => $scope
        ).filter(
            Boolean
        ).map(
            (scope) => [scope, key].join('.')
        ).concat(
            key
        );
    }

    /**
     * find
     * @param  {...[String]} alternatives Different alternatives of strings to find
     * @return {Any} Found match on translations object
     */
    find(...alternatives) {
        const key = alternatives.shift();
        const result = get(this.translations, key);
        const done = typeof result !== 'undefined' || alternatives.length === 0;

        return done ? result : this.find(...alternatives);
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
     * i18n.onmiss((key) => logMissingKeyEvent({key})
     */
    onmiss(callback) {
        if (typeof callback === 'function') {
            this[MISSING] = callback;
        }
        return this;
    }

    /**
     * Register callback to be called when a translation value is empty.
     * Function accepts arguments: {String} missing key
     *                             {String} translation scope
     *                             {Object} The entire translation dictionary
     * @param  {Function} callback
     * @return {self}
     *
     * @example
     * i18n.onempty((key, value) => logEmptyValueEvent({key, value})
     */
    onempty(callback) {
        if (typeof callback === 'function') {
            this[EMPTY] = callback;
        }
        return this;
    }

    /**
     * Register callback to be called when a template injection fails.
     *
     * Function accepts arguments: {String} missing key
     *                             {String} translation scope
     *                             {Object} The entire translation dictionary
     * @param  {Function} callback
     * @return {self}
     *
     * @example
     * i18n.onTemplateInjectionError((key, value) => logTemplateInjectionError({ key, value })
     */
    onTemplateInjectionError(callback) {
        if (typeof callback === 'function') {
            this[TEMPLATE_INJECTION_ERROR] = callback;
        }
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
        this[MISSING] = this.parent[MISSING];
        this[EMPTY] = this.parent[EMPTY];
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
