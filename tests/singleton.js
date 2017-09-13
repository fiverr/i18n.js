const {expect} = require('chai');
const importFresh = require('import-fresh');


describe('Singleton', () => {
    it('sanity on importFresh', () => {
        const I18n_a = importFresh('../');
        const I18n_b = importFresh('../');

        I18n_a.extra_param = 'Extra';
        expect(I18n_a.extra_param).to.not.be.undefined;
        expect(I18n_a.extra_param).to.equal('Extra');
        expect(I18n_b.extra_param).to.be.undefined;
    });

    it('has only one instance in scope', () => {
        const i18n_a = importFresh('../').singleton;
        const i18n_b = importFresh('../').singleton;
        const i18n_c = importFresh('../').singleton;

        i18n_a.add({a: 'one'});
        i18n_b.add({b: 'two'});
        i18n_c.add({b: 'three'});

        expect(i18n_b.t('a')).to.equal('one');
        expect(i18n_b.t('b')).to.equal('three');
    });
});
