type Translations = Record<string, unknown>;
type TranslateOptions = Record<string, unknown>;

declare module '@fiverr/i18n/singleton' {
    const i18n: {
        translations: Translations,
        add: (translations: Translations) => void,
        t: (key: string, options?: TranslateOptions) => string,
    };

    export default i18n;
}
