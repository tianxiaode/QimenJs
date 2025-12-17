import { ValidationResult,createValidationFailure, createValidationSuccess} from '../../core';
import { ArrayValidationRules } from './types';
import { isArray, hasMinLength, hasMaxLength,isString, isRequired,matchesPattern } from '../../rules';
import { allRules } from '../../composition';

/**
 * 构建数组验证器
 * @param rules 字符串验证规则配置
 * @returns 验证函数
 */
export function createArrayValidator(
    rules: ArrayValidationRules = {}
): (value: any[]) => ValidationResult {
    return (value: any[]): ValidationResult => {
        // 1. 处理 null/undefined
        if (value === null || value === undefined) {
            if (rules.required === true || rules.required === 'non-empty') {
                return createValidationFailure('REQUIRED', { 
                    value,
                    required: rules.required 
                });
            }
            return createValidationSuccess();
        }
        
        // 2. 类型检查
        const arrayCheck = isArray(value);
        if (!arrayCheck.isValid) {
            return arrayCheck;
        }
        
        // 3. 检查是否为空数组
        const isEmpty = Array.isArray(value) && value.length === 0;
        if (rules.required === 'non-empty' && isEmpty) {
            return createValidationFailure('ARRAY_EMPTY', {
                value,
                required: 'non-empty'
            });
        }
        
        const validators: Array<(value: any[]) => ValidationResult> = [];
        
        // 4. 长度验证 - 使用 hasLengthBetween 简化代码
        if (rules.minLength !== undefined || rules.maxLength !== undefined) {
            const effectiveMinLength = rules.minLength !== undefined 
                ? Math.max(rules.minLength, rules.required === 'non-empty' ? 1 : 0)
                : (rules.required === 'non-empty' ? 1 : 0);
            
            const effectiveMaxLength = rules.maxLength;
            
            if (effectiveMinLength > 0 && effectiveMaxLength !== undefined) {
                // 使用 hasLengthBetween 进行范围检查
                validators.push(hasLengthBetween(effectiveMinLength, effectiveMaxLength));
            } else if (effectiveMinLength > 0) {
                // 只检查最小长度
                validators.push(hasMinLength(effectiveMinLength));
            } else if (effectiveMaxLength !== undefined) {
                // 只检查最大长度
                validators.push(hasMaxLength(effectiveMaxLength));
            }
        }
        
        // 5. 精确长度验证
        if (rules.exactLength !== undefined) {
            validators.push(hasExactLength(rules.exactLength));
        }
        
        // 6. 唯一性验证
        if (rules.unique && !isEmpty) {
            validators.push(createUniqueValidator(rules.uniqueBy));
        }
        
        // 7. 包含验证 - 使用 isInCollection
        if (rules.includes !== undefined && !isEmpty) {
            validators.push(createArrayIncludesValidator(rules.includes));
        }
        
        // 8. 排除验证 - 使用 isNotInCollection
        if (rules.excludes !== undefined && !isEmpty) {
            validators.push(createArrayExcludesValidator(rules.excludes));
        }
        
        // 9. 排序验证
        if (rules.sorted && !isEmpty) {
            validators.push(createSortedValidator(rules.sortedBy));
        }
        
        // 10. 元素验证 (every - 所有元素必须满足)
        if (rules.items && !isEmpty) {
            validators.push((arr: any[]) => validateAllItems(arr, rules.items!));
        }
        
        // 11. 部分元素验证 (some - 至少一个元素满足)
        if (rules.some && !isEmpty) {
            validators.push(createSomeValidator(rules.some));
        }
        
        // 12. 模式匹配验证
        if (rules.matches && !isEmpty) {
            validators.push(createMatchesValidator(rules.matches));
        }
        
        // 13. 自定义验证
        if (rules.custom) {
            validators.push(rules.custom);
        }
        
        return validators.length > 0 ? allRules(...validators)(value) : createValidationSuccess();
    };
}

// ============== 辅助验证函数 ==============

/**
 * 验证数组所有元素
 */
function validateAllItems(
    value: any[],
    itemValidator: (item: any) => ValidationResult
): ValidationResult {
    const errors: ValidationRuleError[] = [];

    for (let i = 0; i < value.length; i++) {
        const item = value[i];
        const itemResult = itemValidator(item);

        if (!itemResult.isValid) {
            errors.push(
                ...itemResult.errors.map(error => ({
                    ...error,
                    errorCode: `ITEM_${error.errorCode}`,
                    errorParams: {
                        ...(error.errorParams || {}),
                        index: i,
                        item,
                    },
                }))
            );
        }
    }

    if (errors.length === 0) {
        return createValidationSuccess();
    }

    return {
        isValid: false,
        errors,
    };
}

/**
 * 创建唯一性验证器
 */
function createUniqueValidator(
    uniqueBy?: (item: any) => any
): (value: any[]) => ValidationResult {
    return (value: any[]): ValidationResult => {
        const seen = new Set();
        const duplicates: number[] = [];
        
        for (let i = 0; i < value.length; i++) {
            const key = uniqueBy ? uniqueBy(value[i]) : value[i];
            
            if (seen.has(key)) {
                duplicates.push(i);
            } else {
                seen.add(key);
            }
        }
        
        if (duplicates.length > 0) {
            return createValidationFailure('DUPLICATE_ITEMS', {
                value,
                duplicateIndices: duplicates,
                totalDuplicates: duplicates.length
            });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 创建数组包含验证器 - 使用 isInCollection
 */
function createArrayIncludesValidator(
    target: any
): (value: any[]) => ValidationResult {
    return (value: any[]): ValidationResult => {
        // 创建一个单元素数组作为集合
        const collection = [target];
        
        for (let i = 0; i < value.length; i++) {
            const item = value[i];
            const check = isInCollection(collection)(item);
            if (check.isValid) {
                // 找到了包含的元素
                return createValidationSuccess();
            }
        }
        
        // 没有找到
        return createValidationFailure('ARRAY_MISSING_ELEMENT', {
            value,
            missing: target
        });
    };
}

/**
 * 创建数组排除验证器 - 使用 isNotInCollection
 */
function createArrayExcludesValidator(
    target: any
): (value: any[]) => ValidationResult {
    return (value: any[]): ValidationResult => {
        // 创建一个单元素数组作为集合
        const collection = [target];
        
        for (let i = 0; i < value.length; i++) {
            const item = value[i];
            const check = isNotInCollection(collection)(item);
            if (!check.isValid) {
                // 找到了被排除的元素
                return createValidationFailure('ARRAY_CONTAINS_FORBIDDEN', {
                    value,
                    forbidden: target,
                    index: i
                });
            }
        }
        
        // 没有找到被排除的元素
        return createValidationSuccess();
    };
}

/**
 * 创建排序验证器
 */
function createSortedValidator(
    comparator?: (a: any, b: any) => number
): (value: any[]) => ValidationResult {
    return (value: any[]): ValidationResult => {
        const compare = comparator || ((a: any, b: any) => {
            // 默认升序排序
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        });
        
        for (let i = 1; i < value.length; i++) {
            if (compare(value[i-1], value[i]) > 0) {
                return createValidationFailure('ARRAY_NOT_SORTED', {
                    value,
                    index: i,
                    prev: value[i-1],
                    current: value[i]
                });
            }
        }
        
        return createValidationSuccess();
    };
}

/**
 * 创建部分元素验证器
 */
function createSomeValidator(
    predicate: (item: any) => ValidationResult
): (value: any[]) => ValidationResult {
    return (value: any[]): ValidationResult => {
        for (let i = 0; i < value.length; i++) {
            const result = predicate(value[i]);
            if (result.isValid) {
                return createValidationSuccess();
            }
        }
        
        return createValidationFailure('ARRAY_NO_MATCHING_ITEMS', {
            value,
            message: '至少需要一个元素满足条件'
        });
    };
}

/**
 * 创建模式匹配验证器
 */
function createMatchesValidator(
    matcher: (value: any[]) => boolean
): (value: any[]) => ValidationResult {
    return (value: any[]): ValidationResult => {
        if (!matcher(value)) {
            return createValidationFailure('ARRAY_PATTERN_MISMATCH', {
                value
            });
        }
        return createValidationSuccess();
    };
}