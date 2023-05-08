const { glob } = require('./glob');
const { getOneOther } = require('./get-one-other');
const { jsonclone } = require('./jsonclone');
const { isTemplateInjectionEligible, injectTemplates } = require('./templates');

module.exports = {
    glob,
    getOneOther,
    jsonclone,
    isTemplateInjectionEligible,
    injectTemplates
};
