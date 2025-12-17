import {
    ValidationResult,
    createValidationFailure,
    createValidationSuccess,
    ValidationErrorCode,
} from '../../core';
import { isNumber } from './basic';
/**
 * 检查是否为BigInt
 */
export function isBigInt(value: any): ValidationResult {
  if (typeof value === 'bigint') {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_BIGINT, { value });
}




/**
 * 检查是否为有限数字（排除 Infinity 和 NaN）
 */
export function isFiniteNumber(value: any): ValidationResult {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { 
    value, 
    expected: 'finite number' 
  });
}

/**
 * 检查是否为整数
 */
export function isInteger(value: any): ValidationResult {
  if (Number.isInteger(value)) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { 
    value, 
    expected: 'integer' 
  });
}

/**
 * 检查是否为正整数（大于0的整数）
 */
export function isPositiveInteger(value: any): ValidationResult {
  if (Number.isInteger(value) && value > 0) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.NOT_GREATER_THAN, { 
    min: 0, 
    actual: value 
  });
}

/**
 * 检查是否为非负整数（大于等于0的整数）
 */
export function isNonNegativeInteger(value: any): ValidationResult {
  if (Number.isInteger(value) && value >= 0) {
    return createValidationSuccess();
  }
  
  return createValidationFailure(ValidationErrorCode.NOT_GREATER_THAN_OR_EQUAL, { 
    min: 0, 
    actual: value 
  });
}


/**
 * 检查数字是否为整数
 */
export function isInt(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { value });
        }
        
        if (!isInteger(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_INTEGER, { value });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为正数
 */
export function isPositive(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { value });
        }
        
        if (value <= 0) {
            return createValidationFailure(ValidationErrorCode.NOT_POSITIVE, { value });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为负数
 */
export function isNegative(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { value });
        }
        
        if (value >= 0) {
            return createValidationFailure(ValidationErrorCode.NOT_NEGATIVE, { value });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为零
 */
export function isZero(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { value });
        }
        
        if (value !== 0) {
            return createValidationFailure(ValidationErrorCode.NOT_ZERO, { value });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为非零
 */
export function isNonZero(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { value });
        }
        
        if (value === 0) {
            return createValidationFailure(ValidationErrorCode.IS_ZERO, { value });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为偶数
 */
export function isEven(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { value });
        }
        
        if (!isInteger(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_INTEGER, { value });
        }
        
        if (value % 2 !== 0) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_EVEN, { value });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为奇数
 */
export function isOdd(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { value });
        }
        
        if (!isInteger(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_INTEGER, { value });
        }
        
        if (value % 2 === 0) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_ODD, { value });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否在范围内（包含边界）
 */
export function isInRange(min: number, max: number): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { value });
        }
        
        if (value < min || value > max) {
            return createValidationFailure(ValidationErrorCode.OUT_OF_RANGE, {
                value,
                min,
                max,
                actual: value,
            });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否在范围内（不包含边界）
 */
export function isInExclusiveRange(min: number, max: number): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { value });
        }
        
        if (value <= min || value >= max) {
            return createValidationFailure(ValidationErrorCode.OUT_OF_EXCLUSIVE_RANGE, {
                value,
                min,
                max,
                actual: value,
            });
        }
        
        return createValidationSuccess();
    };
}


/**
 * 检查数字是否为安全整数
 */
export function isSafeInteger(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { value });
        }
        
        if (!Number.isSafeInteger(value)) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_SAFE_INTEGER, { value });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为允许的值之一
 */
export function isOneOf(allowedValues: number[]): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { value });
        }
        
        if (!allowedValues.includes(value)) {
            return createValidationFailure(ValidationErrorCode.NOT_IN_ALLOWED_VALUES, {
                value,
                allowedValues,
            });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为不允许的值
 */
export function isNotOneOf(disallowedValues: number[]): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { value });
        }
        
        if (disallowedValues.includes(value)) {
            return createValidationFailure(ValidationErrorCode.IN_DISALLOWED_VALUES, {
                value,
                disallowedValues,
            });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为质数
 */
export function isPrime(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { value });
        }
        
        if (!isInteger(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_INTEGER, { value });
        }
        
        if (value <= 1) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_PRIME, { value });
        }
        
        // 检查质数
        for (let i = 2, s = Math.sqrt(value); i <= s; i++) {
            if (value % i === 0) {
                return createValidationFailure(ValidationErrorCode.TYPE_NOT_PRIME, { value });
            }
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为非 NaN（允许 Infinity）
 */
export function isNotNaN(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { value });
        }
        
        if (isNaN(value)) {
            return createValidationFailure(ValidationErrorCode.TYPE_IS_NAN, { value });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为非 Infinity（允许 NaN）
 */
export function isNotInfinite(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { value });
        }
        
        if (!Number.isFinite(value)) {
            return createValidationFailure(ValidationErrorCode.TYPE_IS_INFINITE, { value });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为有限数或允许的特殊值（NaN/Infinity）
 */
export function isFiniteOrSpecial(allowNaN: boolean = false, allowInfinite: boolean = false): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { value });
        }
        
        if (isNaN(value) && !allowNaN) {
            return createValidationFailure(ValidationErrorCode.TYPE_IS_NAN, { value });
        }
        
        if (!Number.isFinite(value) && !allowInfinite) {
            return createValidationFailure(ValidationErrorCode.TYPE_IS_INFINITE, { value });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为非负数（大于等于0）
 */
export function isNonNegative(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { value });
        }
        
        if (value < 0) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_NON_NEGATIVE, { value });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为非正数（小于等于0）
 */
export function isNonPositive(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { value });
        }
        
        if (value > 0) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_NON_POSITIVE, { value });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为完美平方
 */
export function isPerfectSquare(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { value });
        }
        
        if (!isInteger(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_INTEGER, { value });
        }
        
        if (value < 0) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_PERFECT_SQUARE, { value });
        }
        
        const sqrt = Math.sqrt(value);
        if (!Number.isInteger(sqrt)) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_PERFECT_SQUARE, { value });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为完美立方
 */
export function isPerfectCube(): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { value });
        }
        
        if (!isInteger(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_INTEGER, { value });
        }
        
        // 对于负数立方根也是可能的
        const cubeRoot = Math.cbrt(value);
        if (!Number.isInteger(cubeRoot)) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_PERFECT_CUBE, { value });
        }
        
        return createValidationSuccess();
    };
}

/**
 * 检查数字是否为偶数或允许奇数
 */
export function isEvenOrAllowOdd(allowOdd: boolean = false): (value: any) => ValidationResult {
    return (value: any): ValidationResult => {
        const numberResult = isNumber(value);
        if (!numberResult.isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_NUMBER, { value });
        }
        
        if (!isInteger(value).isValid) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_INTEGER, { value });
        }
        
        if (value % 2 !== 0 && !allowOdd) {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_EVEN, { value });
        }
        
        return createValidationSuccess();
    };
}