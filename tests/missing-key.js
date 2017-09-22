const {expect} = require('chai');

const I18n = require('../');

describe('missing keys report', () => {
    it('reports missing keys', () => {
        const i18n = new I18n({
            $scope: 'some.scope',
            missing: (key, scope, translations) => {
                expect(scope).to.equal('some.scope');
                expect(key).to.equal('a.missing.key');
                expect(translations).to.be.an('object');
                expect(translations).to.be.empty;
            }
        });

        i18n.translate('a.missing.key');
    });

    it('reports missing keys using "onmiss"', () => {
        const i18n = new I18n({$scope: 'some.scope'});

        i18n.onmiss((key, scope, translations) => {
            expect(scope).to.equal('some.scope');
            expect(key).to.equal('a.missing.key');
            expect(translations).to.be.an('object');
            expect(translations).to.be.empty;
        });

        i18n.translate('a.missing.key');
    });
});
