import { CommonRule, ValidationErrorContext } from "../../core";

export interface ContainsRule<T = unknown> extends CommonRule {
    type: "contains";
    target: readonly T[] | ((ctx?: ValidationErrorContext) => readonly T[]);
    contains?: boolean;
    strict?: boolean;
}

export interface UniqueRule extends CommonRule {
    type: "unique";
}