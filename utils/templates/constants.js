/**
 * The regex used to match the name of the template
 * @type {RegExp}
 */
const TEMPLATE_ELEMENT_NAMES_REGEX = /<t name=['"]?([\w-]*?)['"]? ?\/? ?>/g;

/**
 * The regex used to match the translated content for the templates - open and close template element
 * @type {RegExp}
 */
const TEMPLATE_OPEN_CLOSE_ELEMENT_CONTENT_REGEX = /<t name=['"]?[\w-]+['"]?\s?>(.+?)<\/t>/g;

/**
 * The regex used to match the translated content for the templates - self closing template element
 * @type {RegExp}
 */
const TEMPLATE_SELF_CLOSING_ELEMENT_CONTENT_REGEX = /<t name=['"]?[\w-]+['"]? ?\/? ?>/g;

/**
 * The regex used to match br templates that are not self closed
 * @type {RegExp}
 */
const TEMPLATE_BR_OPEN_ONLY_REGEX = /<t name=['"]?br+['"]? ?>/g;
const TEMPLATE_BR_SELF_CLOSING_STRING = "<t name='br' />";

module.exports = {
    TEMPLATE_ELEMENT_NAMES_REGEX,
    TEMPLATE_OPEN_CLOSE_ELEMENT_CONTENT_REGEX,
    TEMPLATE_SELF_CLOSING_ELEMENT_CONTENT_REGEX,
    TEMPLATE_BR_OPEN_ONLY_REGEX,
    TEMPLATE_BR_SELF_CLOSING_STRING
};
