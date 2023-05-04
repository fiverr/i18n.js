const { logger } = require('@fiverr-private/obs');
const {
    UNKNOWN_TEMPLATE_NAME,
    INVALID_TEMPLATE_TYPE,
    TEMPLATE_ELEMENT_NAMES_REGEX,
    TEMPLATE_OPEN_CLOSE_ELEMENT_CONTENT_REGEX,
    TEMPLATE_SELF_CLOSING_ELEMENT_CONTENT_REGEX,
    TEMPLATE_BR_OPEN_ONLY_REGEX,
    TEMPLATE_BR_SELF_CLOSING_STRING
} = require('./constants');

/**
 * Logs an error message when an invalid template type was used.
 * @param {*} template The template used.
 */
const logInvalidTemplateError = (template) => {
    logger.error([
        INVALID_TEMPLATE_TYPE,
        typeof template,
        `(${JSON.stringify(template)})`
    ].join(' '));
};

/**
 * Logs an error message when an unknown template name was used.
 * @param {*} templateName The template used.
 */
const logUnknownTemplateError = (templateName) => {
    logger.error(`${UNKNOWN_TEMPLATE_NAME} ${templateName}`);
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
 * @param {String[]} templateNamesArray The template names matches.
 * @param {Record.<String, Function>} templates The templates passed merged with the predefined templates
 */
const validateTemplates = (templateNamesArray, templates) => {
    // Every second item should be a template.
    // Ex: When we split "<t name='link'>Click</t><t name='bold'>Here</t>" by its regex TEMPLATE_ELEMENT_NAMES_REGEX
    // The output is: ["", "link", "Click</t>", "bold", "Here</t>"]
    // You can see that indexes 1 and 3 contains the names of the templates
    templateNamesArray
        .filter((templateName, i) => (i % 2 === 1 && !templates[templateName]))
        .forEach(logUnknownTemplateError);

    Object.values(templates)
        .filter((template) => !isFunction(template))
        .forEach(logInvalidTemplateError);
};

/**
 * Split the translation by both:
 * 1) open & close elements - <t name='link'>Text</t>
 * 2) self-closing elements - <t name='br' />
 * Example: translations is set to be: "Hi<t name='br' /><t name='link'>Click</t> Here"
 * First split, by TEMPLATE_OPEN_CLOSE_ELEMENT_CONTENT_REGEX will make it:
 * ["Hi<t name='br'/>", "Click", " Here"]
 * Then we iterate over each item and split it again by TEMPLATE_SELF_CLOSING_ELEMENT_CONTENT_REGEX
 * First item is split to ["Hi", ""] The first item is being added to templateContentArray.
 * Then we add an empty string to represent the <t> element itself, and then we add the second item in the split array
 * To represent that it's an empty element.
 * The second and third part of the origin array do not split and being added as is
 * We end up with:
 * ["Hi", "", "", "Click", " Here"]
 * Every second item in this array represent content of specific template:
 * index 1 - br template
 * index 3 - link template
 * @param {String} translation - The translation we got from i18n.
 * @returns {String[]}
 */
const getContentArray = (translation) => {
    const templateContentArray = [];
    translation.split(TEMPLATE_OPEN_CLOSE_ELEMENT_CONTENT_REGEX).forEach((translationPart1) => {
        translationPart1.split(TEMPLATE_SELF_CLOSING_ELEMENT_CONTENT_REGEX).forEach((translationPart2, i) => {
            if (i % 2 === 1) {
                templateContentArray.push(''); // every second item should be an empty text because it's self-closing element
            }
            templateContentArray.push(translationPart2);
        });
    });

    return templateContentArray;
};

/**
 * Finds all template patterns and wraps them with the template (component) that matches its index,
 * while cleaning up the templates' declaration symbols.
 * @param {String} originTranslation The translation into which the templates will be injected.
 * @param {Record.<String, Function>} templates The templates that will be injected.
 * @return {React.Component}
 */
const injectTemplates = (originTranslation, templates = {}) => {
    const translation = originTranslation.replace(TEMPLATE_BR_OPEN_ONLY_REGEX, TEMPLATE_BR_SELF_CLOSING_STRING);
    const templateNamesArray = translation.split(TEMPLATE_ELEMENT_NAMES_REGEX);
    const contentArray = getContentArray(translation);

    validateTemplates(templateNamesArray, templates);

    const tokens = contentArray.map((translationPart, index) => {
        const templateName = templateNamesArray[index];
        const templateFunc = templates[templateName];
        const isTemplate = index % 2 === 1;

        if (!isTemplate || !templateFunc || !isFunction(templateFunc)) {
            return translationPart;
        }

        return templateFunc(translationPart);
    });

    return tokens.join('');
};

/**
 * Determines whether templates should be injected to the given translation
 * @param {String} originTranslation The translation into which the templates will be injected.
 * @return {Boolean}
 */
const shouldInjectTemplates = (originTranslation) => typeof originTranslation === 'string' &&
    Boolean(originTranslation.match(TEMPLATE_ELEMENT_NAMES_REGEX));

module.exports = {
    injectTemplates,
    shouldInjectTemplates
};
