declare module '@fiverr/i18n/singleton' {
    type Translations = Record<string, unknown>;
    type TranslateOptions = Record<string, unknown>;
    type onMissHandler = (key: string, scope: string) => void;
    type onEmptyHandler = (key: string, result: unknown, scope: string) => void;

    const i18n: {
        translations: Translations,
        add: (translations: Translations) => void,
        t: (key: string, options?: TranslateOptions) => string,
        onmiss: (handler: onMissHandler) => void,
        onempty: (handler: onEmptyHandler) => void,
    };

    export default i18n;
}