import { ValidationErrorCode, ValidationErrorParams } from './error-codes';
import { createAssetErrorContext, AssertErrorContextOptions } from './error-context';
import { getLength, isValidCollection, getCollectionText } from './error-context';
import {
  validateMinLength,
  validateMaxLength,
  validateLengthRange,
  validateMin,
  validateMax,
  validateRange,
  validateIn,
  validateNotIn,
  validateAllConstraints,
  validateAnyConstraints,
  validateNotConstraints,
  validateEqualTo,
  validateNotEqualTo,
  validateStrictEqualTo,
  validateStrictNotEqualTo,
  validateGreaterThan,
  validateGreaterThanOrEqualTo,
  validateLessThan,
  validateLessThanOrEqualTo,
  validateBetween,
  validateBetweenExclusive,
  validateEmpty,
  validateNotEmpty,
  validateTruthyConstraint,
  validateFalsyConstraint,
  createRangeValidator,
  createLengthValidator,
  createInValidator
} from '../validators';

/**
 * 最小长度断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertMinLength(
  value: any,
  min: number,
  contextOptions?: AssertErrorContextOptions
): void {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateMinLength(value, min)) {
    const length = getLength(value);
    ctx.throwError(ValidationErrorCode.MIN_LENGTH, { 
      min, 
      actualLength: length,
      value
    });
  }
}

/**
 * 最大长度断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertMaxLength(
  value: any,
  max: number,
  contextOptions?: AssertErrorContextOptions
): void {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateMaxLength(value, max)) {
    const length = getLength(value);
    ctx.throwError(ValidationErrorCode.MAX_LENGTH, { 
      max, 
      actualLength: length,
      value
    });
  }
}

/**
 * 长度范围断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertLengthRange(
  value: any,
  min: number,
  max: number,
  contextOptions?: AssertErrorContextOptions
): void {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateLengthRange(value, min, max)) {
    const length = getLength(value);
    
    // 检查具体是哪个约束失败
    if (length !== undefined) {
      if (length < min) {
        ctx.throwError(ValidationErrorCode.MIN_LENGTH, { 
          min, 
          actualLength: length,
          value
        });
      } else if (length > max) {
        ctx.throwError(ValidationErrorCode.MAX_LENGTH, { 
          max, 
          actualLength: length,
          value
        });
      }
    }
    
    // 如果无法获取长度或未知原因
    ctx.throwError(ValidationErrorCode.NOT_BETWEEN, { 
      lower: min, 
      upper: max, 
      actual: length,
      value
    });
  }
}

/**
 * 最小值断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertMin(
  value: any,
  min: number,
  contextOptions?: AssertErrorContextOptions
): asserts value is number {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateMin(value, min)) {
    if (typeof value !== 'number') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER);
    }
    
    ctx.throwError(ValidationErrorCode.NOT_GREATER_THAN_OR_EQUAL, { 
      min, 
      actual: value 
    });
  }
}

/**
 * 最大值断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertMax(
  value: any,
  max: number,
  contextOptions?: AssertErrorContextOptions
): asserts value is number {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateMax(value, max)) {
    if (typeof value !== 'number') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER);
    }
    
    ctx.throwError(ValidationErrorCode.NOT_LESS_THAN_OR_EQUAL, { 
      max, 
      actual: value 
    });
  }
}

/**
 * 数值范围断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertRange(
  value: any,
  min: number,
  max: number,
  contextOptions?: AssertErrorContextOptions
): asserts value is number {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateRange(value, min, max)) {
    if (typeof value !== 'number') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER);
    }
    
    // 检查具体是哪个约束失败
    if (value < min) {
      ctx.throwError(ValidationErrorCode.NOT_GREATER_THAN_OR_EQUAL, { 
        min, 
        actual: value 
      });
    } else if (value > max) {
      ctx.throwError(ValidationErrorCode.NOT_LESS_THAN_OR_EQUAL, { 
        max, 
        actual: value 
      });
    }
    
    // 未知原因
    ctx.throwError(ValidationErrorCode.NOT_BETWEEN, { 
      lower: min, 
      upper: max, 
      actual: value 
    });
  }
}

/**
 * 包含于集合断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertIn(
  value: any,
  collection: any[] | Set<any> | Record<string, any>,
  contextOptions?: AssertErrorContextOptions
): void {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateIn(value, collection)) {
    if (!isValidCollection(collection)) {
      ctx.throwError(ValidationErrorCode.INVALID_COLLECTION_TYPE);
    }
    
    const collectionText = getCollectionText(collection);
    ctx.throwError(ValidationErrorCode.NOT_IN_COLLECTION, { 
      collection: Array.isArray(collection) ? collection : undefined,
      collectionText,
      value
    });
  }
}

/**
 * 不包含于集合断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertNotIn(
  value: any,
  collection: any[] | Set<any> | Record<string, any>,
  contextOptions?: AssertErrorContextOptions
): void {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateNotIn(value, collection)) {
    if (!isValidCollection(collection)) {
      ctx.throwError(ValidationErrorCode.INVALID_COLLECTION_TYPE);
    }
    
    const collectionText = getCollectionText(collection);
    ctx.throwError(ValidationErrorCode.IN_COLLECTION, { 
      collection: Array.isArray(collection) ? collection : undefined,
      collectionText,
      value
    });
  }
}

/**
 * 所有约束都满足断言函数
 * @throws {InvalidInputError} 当任意验证失败时
 */
export function assertAllConstraints(
  value: any,
  validators: ((v: any) => boolean)[],
  contextOptions?: AssertErrorContextOptions
): void {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateAllConstraints(value, validators)) {
    // 找到第一个失败的验证器
    for (let i = 0; i < validators.length; i++) {
      if (!validators[i](value)) {
        ctx.throwError(ValidationErrorCode.NOT_SATISFY_CONDITION, { 
          validatorIndex: i,
          value
        });
      }
    }
    
    // 如果所有验证器都通过但validateAllConstraints返回false，这是不应该发生的
    ctx.throwError(ValidationErrorCode.ALL_VALIDATIONS_FAILED, { value });
  }
}

/**
 * 任一约束满足断言函数
 * @throws {InvalidInputError} 当所有验证都失败时
 */
export function assertAnyConstraints(
  value: any,
  validators: ((v: any) => boolean)[],
  contextOptions?: AssertErrorContextOptions
): void {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateAnyConstraints(value, validators)) {
    ctx.throwError(ValidationErrorCode.ANY_VALIDATION_FAILED, { value });
  }
}

/**
 * 不满足约束断言函数
 * @throws {InvalidInputError} 当验证通过时
 */
export function assertNotConstraints(
  value: any,
  validator: (v: any) => boolean,
  contextOptions?: AssertErrorContextOptions
): void {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateNotConstraints(value, validator)) {
    ctx.throwError(ValidationErrorCode.NOT_SATISFY_CONDITION, { value });
  }
}

/**
 * 相等断言函数（宽松）
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertEqualTo<T>(
  value: any,
  other: T,
  contextOptions?: AssertErrorContextOptions
): void {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateEqualTo(value, other)) {
    ctx.throwError(ValidationErrorCode.NOT_EQUAL, { 
      expected: other, 
      actual: value 
    } as any);
  }
}

/**
 * 不相等断言函数（宽松）
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertNotEqualTo<T>(
  value: any,
  other: T,
  contextOptions?: AssertErrorContextOptions
): void {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateNotEqualTo(value, other)) {
    ctx.throwError(ValidationErrorCode.EQUAL, { 
      expected: other, 
      actual: value 
    } as any);
  }
}

/**
 * 严格相等断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertStrictEqualTo<T>(
  value: any,
  other: T,
  contextOptions?: AssertErrorContextOptions
): asserts value is T {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateStrictEqualTo(value, other)) {
    ctx.throwError(ValidationErrorCode.NOT_EQUAL, { 
      expected: other, 
      actual: value 
    } as any);
  }
}

/**
 * 严格不相等断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertStrictNotEqualTo<T>(
  value: any,
  other: T,
  contextOptions?: AssertErrorContextOptions
): void {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateStrictNotEqualTo(value, other)) {
    ctx.throwError(ValidationErrorCode.EQUAL, { 
      expected: other, 
      actual: value 
    } as any);
  }
}

/**
 * 大于断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertGreaterThan(
  value: any,
  other: number,
  contextOptions?: AssertErrorContextOptions
): asserts value is number {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateGreaterThan(value, other)) {
    if (typeof value !== 'number') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER);
    }
    
    ctx.throwError(ValidationErrorCode.NOT_GREATER_THAN, { 
      min: other, 
      actual: value 
    });
  }
}

/**
 * 大于等于断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertGreaterThanOrEqualTo(
  value: any,
  other: number,
  contextOptions?: AssertErrorContextOptions
): asserts value is number {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateGreaterThanOrEqualTo(value, other)) {
    if (typeof value !== 'number') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER);
    }
    
    ctx.throwError(ValidationErrorCode.NOT_GREATER_THAN_OR_EQUAL, { 
      min: other, 
      actual: value 
    });
  }
}

/**
 * 小于断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertLessThan(
  value: any,
  other: number,
  contextOptions?: AssertErrorContextOptions
): asserts value is number {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateLessThan(value, other)) {
    if (typeof value !== 'number') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER);
    }
    
    ctx.throwError(ValidationErrorCode.NOT_LESS_THAN, { 
      max: other, 
      actual: value 
    });
  }
}

/**
 * 小于等于断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertLessThanOrEqualTo(
  value: any,
  other: number,
  contextOptions?: AssertErrorContextOptions
): asserts value is number {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateLessThanOrEqualTo(value, other)) {
    if (typeof value !== 'number') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER);
    }
    
    ctx.throwError(ValidationErrorCode.NOT_LESS_THAN_OR_EQUAL, { 
      max: other, 
      actual: value 
    });
  }
}

/**
 * 在范围内断言函数（包含边界）
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertBetween(
  value: any,
  lower: number,
  upper: number,
  contextOptions?: AssertErrorContextOptions
): asserts value is number {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateBetween(value, lower, upper)) {
    if (typeof value !== 'number') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER);
    }
    
    // 检查具体是哪个约束失败
    if (value < lower) {
      ctx.throwError(ValidationErrorCode.NOT_GREATER_THAN_OR_EQUAL, { 
        min: lower, 
        actual: value 
      });
    } else if (value > upper) {
      ctx.throwError(ValidationErrorCode.NOT_LESS_THAN_OR_EQUAL, { 
        max: upper, 
        actual: value 
      });
    }
    
    // 未知原因
    ctx.throwError(ValidationErrorCode.NOT_BETWEEN, { 
      lower, 
      upper, 
      actual: value 
    });
  }
}

/**
 * 在范围内断言函数（不包含边界）
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertBetweenExclusive(
  value: any,
  lower: number,
  upper: number,
  contextOptions?: AssertErrorContextOptions
): asserts value is number {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateBetweenExclusive(value, lower, upper)) {
    if (typeof value !== 'number') {
      ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER);
    }
    
    // 检查具体是哪个约束失败
    if (value <= lower) {
      ctx.throwError(ValidationErrorCode.NOT_GREATER_THAN, { 
        min: lower, 
        actual: value 
      });
    } else if (value >= upper) {
      ctx.throwError(ValidationErrorCode.NOT_LESS_THAN, { 
        max: upper, 
        actual: value 
      });
    }
    
    // 未知原因
    ctx.throwError(ValidationErrorCode.NOT_BETWEEN_EXCLUSIVE, { 
      lower, 
      upper, 
      actual: value 
    });
  }
}

/**
 * 为空断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertEmpty(
  value: any,
  contextOptions?: AssertErrorContextOptions
): void {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateEmpty(value)) {
    ctx.throwError(ValidationErrorCode.NOT_EMPTY, { value });
  }
}

/**
 * 非空断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertNotEmpty(
  value: any,
  contextOptions?: AssertErrorContextOptions
): void {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateNotEmpty(value)) {
    ctx.throwError(ValidationErrorCode.EMPTY, { value });
  }
}

/**
 * 真值断言函数（约束版本）
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertTruthyConstraint(
  value: any,
  contextOptions?: AssertErrorContextOptions
): void {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateTruthyConstraint(value)) {
    ctx.throwError(ValidationErrorCode.NOT_TRUTHY, { value });
  }
}

/**
 * 假值断言函数（约束版本）
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertFalsyConstraint(
  value: any,
  contextOptions?: AssertErrorContextOptions
): void {
  const ctx = createAssetErrorContext(contextOptions);
  
  if (!validateFalsyConstraint(value)) {
    ctx.throwError(ValidationErrorCode.NOT_FALSY, { value });
  }
}

/**
 * 创建范围断言器
 */
export function createRangeAssert(
  min: number,
  max: number,
  contextOptions?: AssertErrorContextOptions
): (value: any) => asserts value is number {
  const ctx = createAssetErrorContext(contextOptions);
  
  return (value: any): asserts value is number => {
    if (!validateRange(value, min, max)) {
      if (typeof value !== 'number') {
        ctx.throwError(ValidationErrorCode.TYPE_NOT_NUMBER);
      }
      
      if (value < min) {
        ctx.throwError(ValidationErrorCode.NOT_GREATER_THAN_OR_EQUAL, { 
          min, 
          actual: value 
        });
      } else {
        ctx.throwError(ValidationErrorCode.NOT_LESS_THAN_OR_EQUAL, { 
          max, 
          actual: value 
        });
      }
    }
  };
}

/**
 * 创建长度断言器
 */
export function createLengthAssert(
  min: number,
  max: number,
  contextOptions?: AssertErrorContextOptions
): (value: any) => void {
  const ctx = createAssetErrorContext(contextOptions);
  
  return (value: any): void => {
    if (!validateLengthRange(value, min, max)) {
      const length = getLength(value);
      
      if (length !== undefined) {
        if (length < min) {
          ctx.throwError(ValidationErrorCode.MIN_LENGTH, { 
            min, 
            actualLength: length,
            value
          });
        } else {
          ctx.throwError(ValidationErrorCode.MAX_LENGTH, { 
            max, 
            actualLength: length,
            value
          });
        }
      }
      
      ctx.throwError(ValidationErrorCode.NOT_BETWEEN, { 
        lower: min, 
        upper: max, 
        actual: length,
        value
      });
    }
  };
}

/**
 * 创建包含断言器
 */
export function createInAssert(
  collection: any[] | Set<any>,
  contextOptions?: AssertErrorContextOptions
): (value: any) => void {
  const ctx = createAssetErrorContext(contextOptions);
  
  return (value: any): void => {
    if (!validateIn(value, collection)) {
      const collectionText = getCollectionText(collection);
      ctx.throwError(ValidationErrorCode.NOT_IN_COLLECTION, { 
        collection: Array.isArray(collection) ? collection : undefined,
        collectionText,
        value
      });
    }
  };
}

/**
 * 组合多个断言函数
 */
export function composeAssertions(
  ...assertions: Array<(value: any) => void>
): (value: any) => void {
  return (value: any): void => {
    for (const assertion of assertions) {
      assertion(value);
    }
  };
}

/**
 * 条件断言：仅当条件满足时才执行断言
 */
export function conditionalAssert(
  condition: boolean,
  assertion: (value: any) => void,
  value: any
): void {
  if (condition) {
    assertion(value);
  }
}