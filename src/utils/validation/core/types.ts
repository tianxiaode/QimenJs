/**
 * 验证规则错误信息接口
 */
export interface ValidationErrorParams {
    // 基础信息
    code?: string;
    value?: any;
    expected?: string | string[];
    actual?: any;

    // 约束参数
    min?: number | string;
    max?: number | string;
    lower?: number;
    upper?: number;

    // 集合参数
    collection?: any[];
    collectionText?: string;
    duplicate?: any;
    missingKey?: string;
    disallowedKey?: string;
    forbiddenKey?: string;
    allowedKeys?: string[];
    disallowedKeys?: string[];

    // 模式参数
    pattern?: string;
    patternText?: string;
    missing?: string[];
    missingRequirements?: string;

    // 结构参数
    index?: number;
    key?: string;
    keyValue?: any;
    minLength?: number;
    maxLength?: number;
    minKeys?: number;
    maxKeys?: number;
    minSize?: number;
    maxSize?: number;
    actualLength?: number;
    actualKeys?: number;
    actualSize?: number;

    // 日期参数
    date?: Date | string;
    minDate?: Date | string;
    maxDate?: Date | string;

    // 上下文参数
    paramName?: string;
    functionName?: string;
    validatorIndex?: number;

    // 扩展参数
    [key: string]: any;
}

export interface ValidationRuleError {
    /**
     * 错误代码
     */
    errorCode: string;

    /**
     * 错误参数
     */
    errorParams?: ValidationErrorParams;

    /**
     * 可选的详细错误信息
     */
    errorMessage?: string;
}

/**
 * 验证规则结果接口
 */
export interface ValidationResult {
    /**
     * 验证是否通过
     */
    isValid: boolean;

    /**
     * 错误列表（可以为空）
     */
    errors: ValidationRuleError[];
}


