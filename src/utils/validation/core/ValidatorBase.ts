import { DuplicateValidatorError } from "./errors";
import { ValidationErrorContext, ValidationResult, ValidatorFunction } from "./types";

export class ValidatorBase {
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
        if (this.validators[key]) {
            // 获取已存在的验证器信息
            const existingValidator = this.validators[key];
            const existingValidatorInfo = this.getValidatorInfo(existingValidator);
            
            // 创建错误并传递详细信息
            throw new DuplicateValidatorError(key, existingValidatorInfo);
        }
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

    /**
     * 获取已注册的验证器类型
     * @returns 验证器类型数组
     */
    public static getRegisteredTypes(): string[] {
        return Object.keys(this.validators);
    }

    /**
     * 获取验证器函数的信息
     * @param validator 验证器函数
     * @returns 函数信息字符串
     */
    private static getValidatorInfo(validator: ValidatorFunction): string {
        // 尝试获取函数名
        const functionName = validator.name || 'anonymous';
        
        // 获取函数源码的前100个字符作为预览
        const functionString = validator.toString();
        const preview = functionString.length > 100 
            ? functionString.substring(0, 100) + '...' 
            : functionString;
            
        return `${functionName} (${preview})`;
    }

    /**
     * 列出所有已注册的验证器
     */
    public static listValidators(): void {
        console.log('[Registered Validators]');
        Object.keys(this.validators).forEach(key => {
            const info = this.getValidatorInfo(this.validators[key]);
            console.log(`- ${key}: ${info}`);
        });
    }

    /**
     * 显示特定验证器的详细信息
     * @param key 验证器键名
     */
    public static showValidator(key: string): void {
        const validator = this.validators[key];
        if (!validator) {
            console.warn(`[Validator] No validator found with key: ${key}`);
            return;
        }

        const info = this.getValidatorInfo(validator);
        console.log(`[Validator Details]
Key: ${key}
Info: ${info}
Source:
${validator.toString()}`);
    }
}

