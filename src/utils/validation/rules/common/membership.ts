import { CommonRule, ValidationErrorContext } from "../../core";

export interface ContainsRule<T = unknown> extends CommonRule {
    target: readonly T[] | ((ctx?: ValidationErrorContext) => readonly T[]);
    contains?: boolean;
    strict?: boolean;
}
