import { ValidationRule, ValidateResult, StringRule, NumberRule, BooleanRule, FileRule, DateRule, ArrayRule, ObjectRule, CompareRule, SplitRule, FormatRule, PasswordRule } from '../types';
interface RuleRegistry {
    string: Omit<StringRule, 'type'>;
    number: Omit<NumberRule, 'type'>;
    boolean: Omit<BooleanRule, 'type'>;
    date: Omit<DateRule, 'type'>;
    array: Omit<ArrayRule, 'type'>;
    object: Omit<ObjectRule, 'type'>;
    password: Omit<PasswordRule, 'type'>;
    compare: Omit<CompareRule, 'type'>;
    file: Omit<FileRule, 'type'>;
    split: Omit<SplitRule, 'type'>;
    format: Omit<FormatRule, 'type'>;
    email: Omit<FormatRule, 'type' | 'format'>;
    url: Omit<FormatRule, 'type' | 'format'>;
    phone: Omit<FormatRule, 'type' | 'format'>;
    uuid: Omit<FormatRule, 'type' | 'format'>;
    ipv4: Omit<FormatRule, 'type' | 'format'>;
    ipv6: Omit<FormatRule, 'type' | 'format'>;
    macAddress: Omit<FormatRule, 'type' | 'format'>;
    hexColor: Omit<FormatRule, 'type' | 'format'>;
    rgbColor: Omit<FormatRule, 'type' | 'format'>;
    rgbaColor: Omit<FormatRule, 'type' | 'format'>;
}
type ValidatorSugar<T> = (value: any, rule: T) => Promise<ValidateResult>;
type NormalizerSugar<T> = (value: any, fallbackValue: any, rule: T) => Promise<any>;
export declare const validate: { readonly [K in keyof RuleRegistry]: ValidatorSugar<RuleRegistry[K]>; } & {
    validate: (value: any, rule: ValidationRule) => Promise<ValidateResult>;
};
export declare const assert: { readonly [K in keyof RuleRegistry]: ValidatorSugar<RuleRegistry[K]>; } & {
    validate: (value: any, rule: ValidationRule) => Promise<void>;
};
export declare const normalize: { readonly [K in keyof RuleRegistry]: NormalizerSugar<RuleRegistry[K]>; };
export {};
//# sourceMappingURL=validate.d.ts.map