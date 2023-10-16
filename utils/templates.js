const { values } = require('lodash');

/**
 * The regex used to match the name of the template
 * @type {RegExp}
 */
const TEMPLATE_ELEMENT_NAMES_REGEX = /<t name=['"]?([\w-]*?)['"]? ?\/? ?>/g;

/**
 * The regex used to match the translated content for the templates - open and
 * close template element
 * @type {RegExp}
 */
const TEMPLATE_OPEN_CLOSE_ELEMENT_CONTENT_REGEX = /<t name=['"]?[\w-]+['"]?\s?>(.+?)<\/t>/g;

/**
 * The regex used to match the translated content for the templates - self
 * closing template element
 * @type {RegExp}
 */
const TEMPLATE_SELF_CLOSING_ELEMENT_CONTENT_REGEX = /<t name=['"]?[\w-]+['"]? ?\/? ?>/g;

/**
 * The regex used to match br templates that are not self closed
 * @type {RegExp}
 */
const TEMPLATE_BR_OPEN_ONLY_REGEX = /<t name=['"]?br+['"]? ?>/g;

/**
 * The string used to replace br templates that are not self closed.
 */
const TEMPLATE_BR_SELF_CLOSING_STRING = '<t name=\'br\' />';

/**
 * The error message logged when passed an invalid template.
 * @type {String}
 */
const INVALID_TEMPLATE_TYPE_ERROR = 'Templates must be functions, instead got:';

/**
 * The error message logged when passed an unknown template name.
 * @type {String}
 */
const UNKNOWN_TEMPLATE_NAME_ERROR = 'Templates must be configured, but the following template name is not:';

/**
 * The default transformer function that will be used to transform the tokens
 * array into a string.
 * @type {Function}
 */
const DEFAULT_TEMPLATES_TRANSFORMER = (tokens) => tokens.join('');

const PREDEFINED_TEMPLATES = {
    'b': (text) => `<b>${text}</b>`,
    'u': (text) => `<u>${text}</u>`,
    'i': (text) => `<i>${text}</i>`,
    'span': (text) => `<span>${text}</span>`,
    'br': () => '<br/>'
};

/**
 * Finds all template patterns and wraps them with the template (component)
 * that matches its index, while cleaning up the templates' declaration
 * symbols.
 * @param {Object} options
 * @param {String} options.originTranslation The translation into which the
 *     templates will be injected.
 * @param {Record.<String, Function>} options.templates The templates that will
 *     be injected.
 * @param {Function} options.templatesTransformer The templates transformer
 *     function
 * @return {String}
 */
const injectTemplates = ({ originTranslation, templates = {}, templatesTransformer = DEFAULT_TEMPLATES_TRANSFORMER }) => {
    const translation = originTranslation.replace(TEMPLATE_BR_OPEN_ONLY_REGEX,
        TEMPLATE_BR_SELF_CLOSING_STRING
    );
    const templateNames = translation.split(TEMPLATE_ELEMENT_NAMES_REGEX);
    const tokens = extractTokens(translation);

    const allTemplates = Object.assign({}, PREDEFINED_TEMPLATES, templates);
    validateTemplates(templateNames, allTemplates);

    const injectedTokens = tokens.map((translationPart, index) => {
        const templateName = templateNames[index];
        const templateFunc = allTemplates[templateName];
        const isTemplate = index % 2 === 1;

        if (!isTemplate || !templateFunc || !isFunction(templateFunc)) {
            return translationPart;
        }

        return templateFunc(translationPart);
    });

    return templatesTransformer(injectedTokens);
};

/**
 * Split the translation by both:
 * 1) open & close elements - <t name='link'>Text</t>
 * 2) self-closing elements - <t name='br' />
 * Example: translations is set to be: "Hi<t name='br' /><t
 * name='link'>Click</t> Here" First split, by
 * TEMPLATE_OPEN_CLOSE_ELEMENT_CONTENT_REGEX will make it:
 * ["Hi<t name='br'/>", "Click", " Here"]
 * Then we iterate over each item and split it again by
 * TEMPLATE_SELF_CLOSING_ELEMENT_CONTENT_REGEX First item is split to ["Hi",
 * ""] The first item is being added to templateContentArray. Then we add an
 * empty string to represent the <t> element itself, and then we add the second
 * item in the split array To represent that it's an empty element. The second
 * and third part of the origin array do not split and being added as is We end
 * up with:
 * ["Hi", "", "", "Click", " Here"]
 * Every second item in this array represent content of specific template:
 * index 1 - br template
 * index 3 - link template
 * @param {String} translation - The translation we got from i18n.
 * @returns {String[]}
 */
const extractTokens = (translation) => {
    const templateTokens = [];

    translation.split(TEMPLATE_OPEN_CLOSE_ELEMENT_CONTENT_REGEX).forEach((translationFirstPart) => {
        translationFirstPart.split(TEMPLATE_SELF_CLOSING_ELEMENT_CONTENT_REGEX).forEach((translationSecondPart, i) => {
            if (i !== 0) {
                templateTokens.push(''); // every second item should be an empty text because it's self-closing element
            }
            templateTokens.push(translationSecondPart);
        });
    });

    return templateTokens;
};

/**
 * Checks whether a given function is actually a function.
 * @param {Function} fn The function to check.
 * @return {Boolean}
 */
const isFunction = (fn) => typeof fn === 'function';

/**
 * Validates that the passed templates:
 * 1. Exists (either as predefined templates or in the custom templates).
 * 2. Are functions.
 * @param {String[]} templateNames The template names matches.
 * @param {Record.<String, Function>} templates The templates passed merged
 *     with the predefined templates
 */
const validateTemplates = (templateNames, templates) => {
    templateNames
        .filter((templateName, i) => {
            console.warn('HEREEEE', i, templateName, templates[templateName]);
            return (i % 2 === 1 && !templates[templateName]);
        })
        .forEach(throwUnknownTemplateError);

    values(templates).
        filter((template) => !isFunction(template)).
        forEach(throwInvalidTemplateError);
};

/**
 * Throw an error when an unknown template name was used.
 * @param {*} templateName The template used.
 */
const throwUnknownTemplateError = (templateName) => {
    throw new Error(`${UNKNOWN_TEMPLATE_NAME_ERROR} ${templateName}`);
};

/**
 * Throw an error when an invalid template type was used.
 * @param {*} template The template used.
 */
const throwInvalidTemplateError = (template) => {
    throw new Error([
        INVALID_TEMPLATE_TYPE_ERROR,
        typeof template,
        `(${JSON.stringify(template)})`
    ].join(' '));
};

/**
 * Determines whether templates should be injected to the given translation
 * @param {String} originTranslation The translation into which the templates
 *     will be injected.
 * @return {Boolean}
 */
const isTemplateInjectionEligible = (originTranslation) =>
    typeof originTranslation === 'string' &&
    Boolean(originTranslation.match(TEMPLATE_ELEMENT_NAMES_REGEX));

module.exports = {
    isTemplateInjectionEligible,
    injectTemplates
};
