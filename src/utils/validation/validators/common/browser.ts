import {
    ValidationErrorBuilder,
    ValidationErrorContext,
    ValidationResult,
    ValidatorBase,
} from '../../core';

/**
 * 验证 FormData 对象
 * 
 * 检查给定值是否为有效的 FormData 实例。
 * 主要用于浏览器环境中验证表单数据对象。
 * 
 * @param value - 需要验证的值
 * @param _rule - 验证规则（此验证器不需要特殊规则配置）
 * @param context - 验证错误上下文信息
 * @returns 验证结果，通过时返回 null，失败时返回包含类型不匹配错误的数组
 */
export function validateFormDate(
    value: any,
    _rule: {},
    context: ValidationErrorContext = {}
): ValidationResult {
    // 检查运行环境是否支持 FormData，并验证值是否为 FormData 实例
    const isFormDataObj = typeof FormData !== 'undefined' && value instanceof FormData;
    
    // 如果不是 FormData 实例，返回类型不匹配错误
    if (!isFormDataObj) {
        return [ValidationErrorBuilder.type_mismatch('FormData', typeof value, context)];
    }
    
    // 验证通过
    return null;
}

/**
 * 验证 URLSearchParams 对象
 * 
 * 检查给定值是否为有效的 URLSearchParams 实例。
 * 用于验证 URL 查询参数对象。
 * 
 * @param value - 需要验证的值
 * @param _rule - 验证规则（此验证器不需要特殊规则配置）
 * @param context - 验证错误上下文信息
 * @returns 验证结果，通过时返回 null，失败时返回包含类型不匹配错误的数组
 */
export function validateURLSearchParams(
    value: any,
    _rule: {},
    context: ValidationErrorContext = {}
): ValidationResult {
    // 检查运行环境是否支持 URLSearchParams，并验证值是否为 URLSearchParams 实例
    const isURLSearchParamsObj =
        typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams;
        
    // 如果不是 URLSearchParams 实例，返回类型不匹配错误
    if (!isURLSearchParamsObj) {
        return [ValidationErrorBuilder.type_mismatch('URLSearchParams', typeof value, context)];
    }
    
    // 验证通过
    return null;
}

/**
 * 验证 Blob 对象
 * 
 * 检查给定值是否为有效的 Blob 实例。
 * 用于验证二进制大对象，如文件内容或其他二进制数据。
 * 
 * @param value - 需要验证的值
 * @param _rule - 验证规则（此验证器不需要特殊规则配置）
 * @param context - 验证错误上下文信息
 * @returns 验证结果，通过时返回 null，失败时返回包含类型不匹配错误的数组
 */
export function validateBlob(
    value: any,
    _rule: {},
    context: ValidationErrorContext = {}
): ValidationResult {
    // 检查运行环境是否支持 Blob，并验证值是否为 Blob 实例
    const isBlobObj = typeof Blob !== 'undefined' && value instanceof Blob;
    
    // 如果不是 Blob 实例，返回类型不匹配错误
    if (!isBlobObj) {
        return [ValidationErrorBuilder.type_mismatch('Blob', typeof value, context)];
    }
    
    // 验证通过
    return null;
}

/**
 * 验证 File 对象
 * 
 * 检查给定值是否为有效的 File 实例。
 * 用于验证文件对象，通常来自文件上传操作。
 * 
 * @param value - 需要验证的值
 * @param _rule - 验证规则（此验证器不需要特殊规则配置）
 * @param context - 验证错误上下文信息
 * @returns 验证结果，通过时返回 null，失败时返回包含类型不匹配错误的数组
 */
export function validateFile(
    value: any,
    _rule: {},
    context: ValidationErrorContext = {}
): ValidationResult {
    // 检查运行环境是否支持 File，并验证值是否为 File 实例
    const isFileObj = typeof File !== 'undefined' && value instanceof File;
    
    // 如果不是 File 实例，返回类型不匹配错误
    if (!isFileObj) {
        return [ValidationErrorBuilder.type_mismatch('File', typeof value, context)];
    }
    
    // 验证通过
    return null;
}

// 注册验证器到全局验证器库中，使其可以通过类型名称调用
ValidatorBase.registerValidator('formData', validateFormDate);
ValidatorBase.registerValidator('urlSearchParams', validateURLSearchParams);
ValidatorBase.registerValidator('blob', validateBlob);
ValidatorBase.registerValidator('file', validateFile);