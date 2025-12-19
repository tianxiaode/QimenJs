import { ValidationErrorContext } from "../core";

export interface ContainsRule<T = unknown> {
    target: readonly T[] | ((ctx?: ValidationErrorContext) => readonly T[]);
    contains?: boolean;
    strict?: boolean;
}
