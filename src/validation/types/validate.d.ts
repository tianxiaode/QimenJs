import { IValidationError, ValidationContext } from "./context";
import type { ValidationRule } from "@orbitjs/schema";
export declare const ValidatorRegistrarName: "validator";
export interface ValidationResult {
    isValid: boolean;
    errors: IValidationError[];
    context: ValidationContext;
    value: any;
}
export type ValidateFunction = (value: any, rule: ValidationRule, context?: Partial<ValidationContext>) => Promise<ValidationResult>;
export type ValidateResult = IValidationError[] | null;
//# sourceMappingURL=validate.d.ts.map