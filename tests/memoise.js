const {expect} = require('chai');

const I18n = require('../');
const translations = require('./translations-stub.json');
const largeStub = require('./translations-stubber')('abcdefghij');

describe('memoise (key lookups)', () => {
    {
        const i18n = new I18n({translations});
        const memory = Object.getOwnPropertySymbols(i18n).filter((symbol) => typeof i18n[symbol] === 'object' &&
            !(i18n[symbol] instanceof Array) &&
            Object.keys(i18n[symbol]).length === 0)[0];
        const dummy = 'something-else';

        const iterations = 1e5;
        const results = [false, true].map((memoise) => {
            const start = Date.now();
            let i = iterations;

            while (i--) {
                i18n.t('controller_name.action_name.name.i.am.in.scope');
                i18n[memoise ? dummy : memory] = {};
            }

            return Date.now() - start;
        });
        const percentage = (results[0] - results[1]) / results[0] * 100;

        it(`memoisation optimises the runtime (result: ${percentage.toFixed(2)}%)`, () => {
            expect(percentage).to.above(2);
        });
    }

    {
        const i18n = new I18n({translations: largeStub.translations});
        const memory = Object.getOwnPropertySymbols(i18n).filter((symbol) => typeof i18n[symbol] === 'object' &&
            !(i18n[symbol] instanceof Array) &&
            Object.keys(i18n[symbol]).length === 0)[0];
        const dummy = 'something-else';

        const iterations = 1e4;
        const results = [false, true].map((memoise) => {
            const start = Date.now();
            let i = iterations;

            while (i--) {
                largeStub.keys.forEach((key) => {
                    i18n.t(key);
                    i18n[memoise ? dummy : memory] = {};
                });
            }

            return Date.now() - start;
        });
        const percentage = (results[0] - results[1]) / results[0] * 100;

        it(`memoisation on extra large collections optimises by more than 10% (result: ${percentage.toFixed(2)}%)`, function() {
            this.retries(3);

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
