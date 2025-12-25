import { RuleBaseOptions, ValidationErrorContext } from "../../core";

export interface ContainsRuleOptions<T = unknown> extends RuleBaseOptions {
    target: readonly T[] | ((ctx?: ValidationErrorContext) => readonly T[]);
    contains?: boolean;
    strict?: boolean;
}
