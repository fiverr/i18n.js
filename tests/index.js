const { assert, expect } = require('chai');

const I18n = require('../');
const translations = require('./translations-stub.json');

const $scope = 'controller_name.action_name';

describe('I18n', () => {
    const i18n = new I18n({ translations, $scope });

    it('object initiates correctly', () => {
        expect(translations).to.deep.equal(translations);
        assert(i18n.$scope === $scope);
    });

    it('can initiate w/o options', () => {
        expect(() => new I18n()).to.not.throw();
    });

    it('instance translations cannot be set', () => {
        const newTranslations = { a: 1 };
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
            something: { is: { an: 'object' } }
        });

        i18n.translations.something.add_key = 'Added key';
        expect(i18n.translations.something).to.be.an('object');
        expect(i18n.translations.something).to.not.have.any.keys(['add_key']);
    });

    it('adding assigns only relevant endpoints', () => {
        i18n.add({ new: { item: { a: 'A!', b: 'B!' } } });

        expect(i18n.translate('new.item.a')).to.equal('A!');
        expect(i18n.translate('new.item.b')).to.equal('B!');

        i18n.add({ new: { item: { b: 'BEE!' } } });

        expect(i18n.translate('new.item.a')).to.equal('A!');
        expect(i18n.translate('new.item.b')).to.equal('BEE!');
    });

    it('i18n translates keys', () => {
        expect(i18n.translate('root.user.name')).to.equal('Martin');
    });

    it('i18n uses keys list to find an existing key', () => {
        expect(i18n.translate([
            'root_user_name',
            'root.user.name'
        ])).to.equal('Martin');
    });

    it('translate function is bound to instance', () => {
        const translate = i18n.translate;

        expect(translate('root.user.name')).to.equal('Martin');

        const t = i18n.t;

        expect(t('root.user.name')).to.equal('Martin');
    });

    it('i18n t aliases translate', () => {
        expect(i18n.t).to.equal(i18n.translate);
        expect(i18n.t('root.user.name')).to.equal('Martin');
    });

    it('interpolates values', () => {
        const params = { item: 'a thing', another: 'a different thing' };

        expect(i18n.translate('root.interpolated.phrase', { params }))
            .to.equal('Please replace a thing with a thing and a different thing thing');
    });

    it('i18n returns default value', () => {
        expect(I18n.getDefault('root.user.age')).to.equal('age');
        expect(i18n.translate('root.user.age')).to.equal('age');
    });

    it('one other', () => {
        expect(i18n.translate('root.wait')).to.be.an('object');
        expect(i18n.translate('root.wait', { params: { count: 1 } })).to.equal('Wait one day');
        expect(i18n.translate('root.wait', { params: { count: 2 } })).to.equal('Wait 2 days');
        expect(i18n.translate('root.wait', { params: { count: 'two' } })).to.equal('Wait two days');
    });

    it('more types', () => {
        expect(i18n.translate('root.is.a.number')).to.be.a('number');
        expect(i18n.translate('root.is.a.boolean')).to.be.a('boolean');
        expect(i18n.translate('root.is.a.object')).to.be.an('object');
    });

    it('add translations - value type: object', () => {
        expect(i18n.translate('just.another.missing_key')).to.equal('missing key');
        i18n.add({ just: { another: { missing_key: 'different value' } } });
        expect(i18n.translate('just.another.missing_key')).to.equal('different value');
        i18n.add({ yet: { another: { key: 'I exist, too' } } });
        expect(i18n.translate('yet.another.key')).to.equal('I exist, too');
    });

    it('add translations - value type: array', () => {
        expect(i18n.translate('just.another.missing_key_for_array')).to.equal('missing key for array');
        i18n.add({ just: { another: { missing_key_for_array: ['a', 'b'] } } });
        expect(i18n.translate('just.another.missing_key_for_array')).to.deep.equal(['a', 'b']);
        i18n.add({ just: { another: { missing_key_for_array: ['a', 'b', 'c'] } } });
        expect(i18n.translate('just.another.missing_key_for_array')).to.deep.equal(['a', 'b', 'c']);
    });

    it('finds translations in scope', () => {
        expect(i18n.translate('controller_name.action_name.i.am.in.scope')).to.equal('I am in scope');

        expect(i18n.translate('i.am.in.scope')).to.equal('I am in scope');
    });

    it('passed in scope (prefered over pre set scope)', () => {
        expect(i18n.translate(`${i18n.$scope}.i.am.in.scope`)).to.equal('I am in scope');

        expect(i18n.translate('i.am.in.scope', {
            params: { $scope: 'another_controller_name.action_name' }
        })).to.equal('I am in a different scope');
    });

    it('keys arrays performs lookup in scope', () => {
        expect(i18n.translate(
            [
                'i.am.not.found',
                'i.am.in.scope'
            ],
            {
                params: { $scope: 'another_controller_name.action_name' }
            }
        )).to.equal('I am in a different scope');
    });

    it('prefers contextual string to non contextual (found in scope)', () => {
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

        expect(i18n.translate('i.am.in.scope')).to.equal('I am in scope');
    });

    it('searches for available keys', () => {
        const i18n = new I18n();

        i18n.add({
            lookup: { key: 'balue', biscuit: '' }
        });

        [
            ['lookup.key'],
            ['lookup.biscuit'],
            [['lookup.pie', 'lookup.key']],
            ['key', { $scope: 'lookup' }],
            [['pie', 'key'], { $scope: 'lookup' }]
        ].forEach(
            (args) => expect(i18n.has(...args), args).to.be.true
        );

        [
            ['lookup.pie'],
            [['lookup.pie', 'lookup.cake']],
            ['key'],
            [],
            [null]
        ].forEach(
            (args) => expect(i18n.has(...args), args).to.be.false
        );

        const child = i18n.spawn('lookup');

        expect(child.has('key'), 'child.key').to.be.true;
        expect(child.has('biscuit'), 'child.biscuit').to.be.true;
        expect(child.has('pie'), 'child.pie').to.be.false;
    });

    describe('templates', () => {
        const templates = {
            custom: (text) => `<a class='my-link'>${text}</a>`
        };

        expect(i18n.translate('root.templated.custom', { templates }))
            .to.equal("Please click <a class='my-link'>here</a> to continue");
    });
});
