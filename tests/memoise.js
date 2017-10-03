const {expect} = require('chai');

const I18n = require('../');
const translations = require('./translations-stub.json');

describe('memoise (key lookups)', () => {
    {
        const i18n = new I18n({translations});
        const memory = Object.getOwnPropertySymbols(i18n).filter((symbol) => typeof i18n[symbol] === 'object' &&
            !(i18n[symbol] instanceof Array) &&
            Object.keys(i18n[symbol]).length === 0)[0];
        const iterations = 1e5;
        const results = [false, true].map((memoise) => {
            const start = Date.now();
            let i = iterations;

            while (i--) {
                i18n.t('controller_name.action_name.name.i.am.in.scope');
                if (!memoise) {
                    i18n[memory] = {};
                }
            }

            return Date.now() - start;
        });
        const percentage = (results[0] - results[1]) / results[0] * 100;

        it(`memoisation optimises by more than 10% (result: ${percentage.toFixed(2)}%)`, () => {
            expect(percentage).to.above(10);
        });
    }

    it('add clears the memory', () => {
        const i18n = new I18n({translations});

        expect(i18n.t('controller_name.action_name.i.am.in.scope')).to.equal('I am in scope');
        i18n.add({
            controller_name: {
                action_name: {
                    i: {
                        am: {
                            in: {
                                scope: 'I was modified'
                            }
                        }
                    }
                }
            }
        });
        expect(i18n.t('controller_name.action_name.i.am.in.scope')).to.equal('I was modified');
    });
});
