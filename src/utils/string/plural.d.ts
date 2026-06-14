export interface PluralRule {
    test: (word: string) => boolean;
    apply: (word: string) => string;
}
export declare function pluralize(word: string, options?: {
    irregular?: Record<string, string>;
    rules?: PluralRule[];
}): string;
export declare function plural(count: number, singular: string, pluralForm: string): string;
export declare function pluralWithCount(count: number, singular: string, pluralForm: string): string;
//# sourceMappingURL=plural.d.ts.map