const {expect} = require('chai');

const I18n = require('../');
const translations = require('./translations-stub.json');

describe('child instances', () => {
    const i18n = new I18n({translations});
    const child = i18n.spawn('controller_name.action_name');

    it('Can spawn a child with no scope', () => {
        const orphan = i18n.spawn();
        expect(orphan.t('root.user.name')).to.equal('Martin');
    });

    it('Child finds namespaced translations', () => {
        expect(child.t('i.am.in.scope')).to.equal('I am in scope');
    });

    it('Parent does not find namespaced translations', () => {
        expect(i18n.t('i.am.in.scope')).to.equal('scope');
    });

    it('Child finds top level translations', () => {
        expect(child.t('root.user.name')).to.equal('Martin');
    });

    it('Child adds translations to the parent\'s store under a namespace', () => {
        child.add({nonsense: {words: 'Non sense words'}});
        child.add({introduction: 'Hi, my name is %{username}'});

        expect(child.t('introduction', {username: 'Martin'})).to.equal('Hi, my name is Martin');
        expect(i18n.t('controller_name.action_name.introduction', {username: 'Martin'})).to.equal('Hi, my name is Martin');
    });

    it('Child\'s $scope is an approachable attribute', () => {
        child.$scope = 'another_controller_name.action_name';
        expect(child.t('i.am.in.scope')).to.equal('I am in a different scope');
    });

    it('Child\'s scope in nested under parent\'s scope (when applicable)', () => {
        const i18n = new I18n({translations, $scope: 'en'});
        const child = i18n.spawn('page');

        expect(i18n.t('title')).to.equal('My App');
        expect(child.t('title')).to.equal('My Page');
    });
});
