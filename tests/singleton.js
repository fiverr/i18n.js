const {expect} = require('chai');
const importFresh = require('import-fresh');

const _global = global;

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

    it('returns whatever is already on the global scope', () => {
        _global.i18n.appendix = 'appendix';
        const i18n_a = importFresh('../').singleton;
        expect(i18n_a.appendix).to.equal('appendix');
    });

    describe('singleton is locked to the global scope', () => {
        const i18nInstance = importFresh('../').singleton;

        it('Gets the global name "i18n"', () => {
            expect(i18nInstance).to.equal(_global.i18n);
        });

        it('Can not be re assigned', () => {
            _global.i18n = null;
            expect(_global.i18n).to.equal(i18nInstance);
            expect(_global.i18n).to.not.equal(null);
        });

        it('Can not ne deleted', () => {
            delete _global.i18n;
            expect(_global.i18n).to.be.an('object');
        });

        it('Is not enumerable on the global object', () => {
            expect(_global).to.not.have.any.keys('i18n');
        });
    });
});
