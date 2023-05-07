const { getOneOther } = require('./get-one-other');
const { jsonclone } = require('./jsonclone');
const { glob } = require('./glob');
const { shouldInjectTemplates, injectTemplates } = require('./templates');

module.exports = {
    getOneOther,
    jsonclone,
    glob,
    shouldInjectTemplates,
    injectTemplates
};
