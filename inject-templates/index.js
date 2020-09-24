const has = require('../utils/has');
const { templateStartSymbol, templateEndSymbol } = require('./config');

const templateRegex = new RegExp(`\\${templateStartSymbol}([^${templateStartSymbol}${templateEndSymbol}]+)${templateEndSymbol}`, 'g');

function injectTemplates(translation, data) {
    if (!data || !has(data, '$templates')) {
        return translation;
    }

    const templates = data.$templates;

    let result = translation;

    let match = result.match(templateRegex);
    let i = 0;

    while (match && match.length) {
        const currentMatch = match[0];
        const currentTemplate = templates[i];

        const [prefix, matchContent, suffix] = deconstruct(result, currentMatch);
        result = `${prefix}${currentTemplate(matchContent)}${suffix}`;

        match = result.match(templateRegex);
        i++;
    }

    return result;
}

function deconstruct(result, match) {
    const prefix = extractPrefix(result);
    const matchContent = extractMatchContent(match);
    const suffix = extractSuffix(result, prefix, match);

    return [prefix, matchContent, suffix];
}

function extractPrefix(result) {
    const startIndex = 0;
    const length = result.search(templateRegex);

    return result.substring(startIndex, length);
}

function extractMatchContent(match) {
    const startIndex = templateStartSymbol.length;
    const length = match.length - templateStartSymbol.length - templateEndSymbol.length + 1;

    return match.substring(startIndex, length);
}

function extractSuffix(result, prefix, match) {
    const startIndex = prefix.length + match.length;
    return result.substring(startIndex);
}

module.exports = injectTemplates;
