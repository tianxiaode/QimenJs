import { CommonRule, ValidationErrorContext, ValidationResult, ValidatorFunction } from "./types";

class ValidatorBase {
    private static validators: Record<
        string,
        ValidatorFunction
    > = {};

    /**
     * 注册验证器
     * @param key 验证器的唯一标识
     * @param validator 验证器函数
     */
    public static registerValidator(
        key: string,
        validator: ValidatorFunction
    ) {
        this.validators[key] = validator;
    }

    /**
     * 获取验证器
     * @param key 验证器的唯一标识
     * @returns 验证器函数
     */
    public static getValidator(
        key: string
    ): ValidatorFunction {
        return this.validators[key];
    }

    /**
     * 执行验证
     * @param key 验证器的唯一标识
     * @param value 验证的值
     * @param rule 验证规则
     * @returns 错误信息或null
     */
    public static executeValidator(
        key: string,
        value: any,
        rule: any,
        context: ValidationErrorContext = {}
    ): ValidationResult {
        const validator = this.getValidator(key);
        return validator(value, rule, context);
    }
}

export { ValidatorBase };
