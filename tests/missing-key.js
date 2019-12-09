const {expect} = require('chai');

const I18n = require('../');

describe('missing keys report', () => {
    it('reports missing keys', () => {
        let reported = false;
        const i18n = new I18n({
            $scope: 'some.scope',
            missing: (key, scope, translations) => {
                reported = true;
                expect(scope).to.equal('some.scope');
                expect(key).to.equal('a.missing.key');
                expect(translations).to.be.an('object');
                expect(translations).to.be.empty;
            }
        });

        i18n.translate('a.missing.key');
        expect(reported).to.be.true;
    });

    it('reports missing key for undefined', () => {
        let reported = false;
        const i18n = new I18n({
            $scope: 'some.scope',
            missing: (key, scope, translations) => {
                reported = true;
                expect(scope).to.equal('some.scope');
                expect(key).to.equal('undefined');
                expect(translations).to.be.an('object');
                expect(translations).to.be.empty;
            }
        });

        i18n.translate();
        expect(reported).to.be.true;
    });

    it('reports missing keys for arrays', () => {
        let reported = false;
        const i18n = new I18n({
            $scope: 'some.scope',
            missing: (key, scope, translations) => {
                reported = true;
                expect(scope).to.equal('some.scope');
                expect(key).to.equal('a.missing.key,another.missing.key');
                expect(translations).to.be.an('object');
                expect(translations).to.be.empty;
            }
        });

        i18n.translate(['a.missing.key', 'another.missing.key']);
        expect(reported).to.be.true;
    });

    it('does not report missing key when one of the keys was found', () => {
        let reported = false;
        const i18n = new I18n({
            $scope: 'some.scope',
            missing: () => {
                reported = true;
            },
            translations: {
                fallback: 'falling back'
            }
        });

        const translation = i18n.translate(['a.missing.key', 'fallback']);
        expect(reported).to.be.false;
        expect(translation).to.equal('falling back');
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
