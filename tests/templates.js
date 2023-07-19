const { expect } = require('chai');
const I18n = require('../');
const translations = require('./translations-stub');

const $scope = 'controller_name.action_name';

describe('Template injection', () => {
    const i18n = new I18n({ translations, $scope });

    describe('When a custom template is provided', () => {
        describe('When full enclosed tag', () => {
            it('Should inject custom template', () => {
                const templates = {
                    custom: (text) => `[${text}]`
                };

                const translated = i18n.translate('root.templated.custom', { templates });

                expect(translated).to.equal('Please click [here] to continue');
            });
        });

        describe('When self enclosed tag', () => {
            it('Should inject custom template', () => {
                const templates = {
                    custom: () => '<here>'
                };

                const translated = i18n.translate('root.templated.self_enclosing', { templates });

                expect(translated).to.equal('Please click <here> to continue');
            });
        });

        describe('When template is not found', () => {
            it('Should call onTemplateInjectionError hook and return undefined', () => {
                let reported = false;

                i18n.onTemplateInjectionError((key, scope, error) => {
                    reported = true;
                    expect(key).to.equal('root.templated.custom');
                    expect(scope).to.equal($scope);
                    expect(error).to.equal('Templates must be configured, but the following template name is not: custom');
                });

                const translated = i18n.translate('root.templated.custom');

                expect(translated).to.be.undefined;
                expect(reported).to.be.true;
            });
        });

        describe('When template is not found', () => {
            it('Should call onTemplateInjectionError hook and return undefined', () => {
                let reported = false;

                i18n.onTemplateInjectionError((key, scope, error) => {
                    reported = true;
                    expect(key).to.equal('root.templated.custom');
                    expect(scope).to.equal($scope);
                    expect(error).to.equal('Templates must be functions, instead got: string ("invalid")');
                });

                const templates = {
                    custom: 'invalid'
                };

                const translated = i18n.translate('root.templated.custom', {
                    templates
                });

                expect(translated).to.be.undefined;
                expect(reported).to.be.true;
            });
        });
    });
});
