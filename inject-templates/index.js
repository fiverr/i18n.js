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
        const search = result.search(templateEndSymbol);

        const currentMatch = match[0];
        const currentTemplate = templates[i];

        const prefix = result.substring(0, search);
        const matchContent = currentMatch.substring(templateStartSymbol.length, currentMatch.length - templateStartSymbol.length - templateEndSymbol.length + 1);
        const suffix = result.substring(prefix.length + currentMatch.length);

        result = `${prefix}${currentTemplate(matchContent)}${suffix}`;

        match = result.match(templateRegex);
        i++;
    }

    return result;
}

module.exports = injectTemplates;
