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

    it('uses last part of the key on missing', () => {
        let reported = false;
        const i18n = new I18n({
            $scope: 'some.scope',
            missing: (key, scope, translations) => {
                reported = true;
            }
        });

        const value = i18n.translate('some.thing.is_missing');
        expect(value).to.equal('is missing');
        expect(reported).to.be.true;
    });

    it('uses onmiss return value as fallback', () => {
        let reported = false;
        const i18n = new I18n({
            $scope: 'some.scope',
            missing: (key, scope, translations) => {
                reported = true;
                return 'Fallback';
            }
        });

        const value = i18n.translate('some.thing.is_missing');
        expect(value).to.equal('Fallback');
        expect(reported).to.be.true;
    });

    it('uses onempty return value as fallback', () => {
        let reported = false;
        const i18n = new I18n({
            $scope: 'some.scope',
            translations: {
                base: {
                    some_key: ''
                }
            },
            empty: (key, scope, translations) => {
                reported = true;
                return 'Fallback';
            }
        });

        const value = i18n.translate('base.some_key');
        expect(value).to.equal('Fallback');
        expect(reported).to.be.true;
    });

    [
        '',
        null
    ].forEach(
        (item) => it(`reports empty value for ${item}`, () => {
            let reported = false;
            const i18n = new I18n({
                $scope: 'some.scope',
                translations: {
                    base: {
                        some_key: item
                    }
                },
                empty: (key, value, scope, translations) => {
                    reported = true;
                    expect(scope).to.equal('some.scope');
                    expect(key).to.equal('base.some_key');
                    expect(value).to.equal(`${item}`);
                    expect(translations).to.be.an('object');
                }
            });

            const value = i18n.translate('base.some_key');
            expect(reported).to.be.true;
            expect(value).to.equal('some key');
        })
    );

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
