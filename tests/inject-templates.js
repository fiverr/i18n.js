const { expect } = require('chai');
const injectTemplates = require('../inject-templates');
const { templateStartSymbol, templateEndSymbol } = require('../inject-templates/config');

describe('inject-templates', () => {
    describe('when data.$templates is undefined', () => {
        const translation = 'some translation';
        const data = { '$not-templates': 123 };
        const expectedResult = translation;

        it('should return `translation`', () => {
            expect(injectTemplates(translation, data)).to.equal(expectedResult);
        });
    });

    describe('when data.$templates is defined', () => {
        describe('when translation contains 1 template', () => {
            const translation = `Hey, Mark! Please ${templateStartSymbol}click here${templateEndSymbol} to view our latest blah blah`;
            const data = {
                '$templates': [
                    (text) => `<a href="#">${text}</a>`
                ]
            };
            const expectedResult = 'Hey, Mark! Please <a href="#">click here</a> to view our latest blah blah';

            it('should inject the templates into the translation string', () => {
                expect(injectTemplates(translation, data)).to.equal(expectedResult);
            });
        });

        describe('when translation contains 2 templates', () => {
            const translation = `Hey, ${templateStartSymbol}Mark${templateEndSymbol}! Please ${templateStartSymbol}click here${templateEndSymbol} to view our latest blah blah`;
            const data = {
                '$templates': [
                    (text) => `<strong>${text}</strong>`,
                    (text) => `<a href="#">${text}</a>`
                ]
            };
            const expectedResult = 'Hey, <strong>Mark</strong>! Please <a href="#">click here</a> to view our latest blah blah';

            it('should inject the templates into the translation string', () => {
                expect(injectTemplates(translation, data)).to.equal(expectedResult);
            });
        });
    });
});
