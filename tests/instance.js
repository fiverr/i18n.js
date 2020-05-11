const { expect } = require('chai');
const instance = require('../instance');

describe('Instance', () => {
    it('exports an I18n instance', () => {
        expect(instance.constructor.name).to.equal('I18n');
    });
});
