const {expect} = require('chai');

const I18n = require('../');

describe('post processing', () => {
    it('Should pass the results in supplied functions', () => {
        const i18n = new I18n({translations: {something: 'Ending with spaces   '}});
        expect(i18n.t('something')).to.equal('Ending with spaces   ');

        i18n.modify((value) => value.replace(/\s*$/, '&nbsp;'));
        expect(i18n.t('something')).to.equal('Ending with spaces&nbsp;');
    });
    it('Should accept option in instantiation', () => {
        const i18n = new I18n({
            translations: {something: 'Ending with spaces   '},
            modify: (value) => value.replace(/\s*$/, '&nbsp;')
        });

        expect(i18n.t('something')).to.equal('Ending with spaces&nbsp;');
    });
    it('Should execute multiple processors in order', () => {
        const i18n = new I18n({
            translations: {something: 'Ending with spaces   '},
            modify: (value) => value.replace(/\s*$/, '&nbsp;')
        });
        i18n.modify((value) => value.replace(/&nbsp;/, ''));
        expect(i18n.t('something')).to.equal('Ending with spaces');
    });
});
