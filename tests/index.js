const {assert, expect} = require('chai');

const I18n = require('../');
const translations = require('./translations-stub');
const $scope = 'controller_name.action_name';

describe('I18n', () => {
    const i18n = new I18n({translations, $scope});

    it('object initiates correctly', () => {
        expect(translations).to.deep.equal(translations);
        assert(i18n.$scope === $scope);
    });

    it('can initiate w/o options', () => {
        expect(() => new I18n()).to.not.throw();
    });

    it('instance translations cannot be set', () => {
        const newTranslations = {a: 1};
        i18n.translations = newTranslations;

        expect(i18n.translations).not.to.deep.equal(newTranslations);
        expect(i18n.translations).to.deep.equal(translations);
    });

    it('instance translations are immutable', () => {
        i18n.translations.add_key = 'Added key';
        expect(i18n.translations).to.not.have.any.keys(['add_key']);

        i18n.translations.root.add_key = 'Added key';
        expect(i18n.translations.root).to.not.have.any.keys(['add_key']);

        i18n.add({
            something: {is: {an: 'object'}}
        });

        i18n.translations.something.add_key = 'Added key';
        expect(i18n.translations.something).to.be.an('object');
        expect(i18n.translations.something).to.not.have.any.keys(['add_key']);
    });

    it('adding assigns only relevant endpoints', () => {
        i18n.add({ new: {item: {a: 'A!', b: 'B!'}} });

        expect(i18n.translate('new.item.a')).to.equal('A!');
        expect(i18n.translate('new.item.b')).to.equal('B!');

        i18n.add({ new: {item: {b: 'BEE!'}} });

        expect(i18n.translate('new.item.a')).to.equal('A!');
        expect(i18n.translate('new.item.b')).to.equal('BEE!');
    });

    it('i18n translates keys', () => {
        expect(i18n.translate('root.user.name')).to.equal('Martin');
    });

    it('translate function is bound to instance', () => {
        const translate = i18n.translate;

        expect(translate('root.user.name')).to.equal('Martin');
    });

    it('interpolates values', () => {
        expect(i18n.translate('root.interpolated.phrase', {item: 'a thing', another: 'a different thing'}))
            .to.equal('Please replace a thing with a thing and a different thing thing');
    });

    it('i18n returns default value', () => {
        expect(I18n.getDefault('root.user.age')).to.equal('age');
        expect(i18n.translate('root.user.age')).to.equal('age');
    });

    it('one other', () => {
        expect(i18n.translate('root.wait')).to.be.an('object');
        expect(i18n.translate('root.wait', {count: 1})).to.equal('Wait one day');
        expect(i18n.translate('root.wait', {count: 2})).to.equal('Wait 2 days');
        expect(i18n.translate('root.wait', {count: 'two'})).to.equal('Wait two days');
    });

    it('more types', () => {
        expect(i18n.translate('root.is.a.number')).to.be.a('number');
        expect(i18n.translate('root.is.a.boolean')).to.be.a('boolean');
        expect(i18n.translate('root.is.a.object')).to.be.an('object');
        expect(i18n.translate('root.is.a.null')).to.be.a('null');
    });

    it('add translations', () => {
        expect(i18n.translate('just.another.missing_key')).to.equal('missing key');
        i18n.add({just: {another: {missing_key: 'different value'}}});
        expect(i18n.translate('just.another.missing_key')).to.equal('different value');
        i18n.add({yet: {another: {key: 'I exist, too'}}});
        expect(i18n.translate('yet.another.key')).to.equal('I exist, too');
    });

    it('finds translations in scope', () => {
        expect(i18n.translate('controller_name.action_name.i.am.in.scope')).to.equal('I am in scope');

        expect(i18n.translate('i.am.in.scope')).to.equal('I am in scope');
    });

    it('passed in scope (prefered over pre set scope)', () => {
        expect(i18n.translate(`${i18n.$scope}.i.am.in.scope`)).to.equal('I am in scope');

        expect(i18n.translate('i.am.in.scope', {
            $scope: 'another_controller_name.action_name'
        })).to.equal('I am in a different scope');
    });

    it('prefers non contextual string to contextual (found in scope)', () => {
        const more = {
            i: {
                am: {
                    in: {
                        scope: 'and now for something completely different'
                    }
                }
            }
        };
        i18n.add(more);

        expect(i18n.translate('i.am.in.scope')).to.equal('and now for something completely different');
    });
});

require('./missing-key')();
