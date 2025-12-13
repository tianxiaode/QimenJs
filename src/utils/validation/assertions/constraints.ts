// constraints.ts
import { ValidationErrorCode, ValidationErrorParams } from '../rules/error-codes';
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
  createInValidator,
} from '../validators';

/**
 * 最小长度断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertMinLength(
  value: any,
  min: number,
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
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
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
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
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateLengthRange(value, min, max)) {
    ctx.throwError(ValidationErrorCode.NOT_BETWEEN, { 
      lower: min, 
      upper: max, 
      actual: getLength(value),
      value
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
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateIn(value, collection)) {
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
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateNotIn(value, collection)) {
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
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateAllConstraints(value, validators)) {
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
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
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
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateNotConstraints(value, validator)) {
    ctx.throwError(ValidationErrorCode.NOT_SATISFY_CONDITION, { value });
  }
}

/**
 * 相等断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertEqualTo<T>(
  value: any,
  other: T,
  strict: boolean = false,
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateEqualTo(value, other, strict)) {
    ctx.throwError(ValidationErrorCode.NOT_EQUAL, { 
      expected: other, 
      actual: value 
    } as any);
  }
}

/**
 * 不相等断言函数
 * @throws {InvalidInputError} 当验证失败时
 */
export function assertNotEqualTo<T>(
  value: any,
  other: T,
  strict: boolean = false,
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateNotEqualTo(value, other, strict)) {
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
  other: any,
  strict: boolean = false,
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateGreaterThan(value, other, strict)) {
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
  other: any,
  strict: boolean = false,
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateGreaterThanOrEqualTo(value, other, strict)) {
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
  other: any,
  strict: boolean = false,
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateLessThan(value, other, strict)) {
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
  other: any,
  strict: boolean = false,
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateLessThanOrEqualTo(value, other, strict)) {
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
  lower: any,
  upper: any,
  strict: boolean = false,
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateBetween(value, lower, upper, strict)) {
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
  lower: any,
  upper: any,
  strict: boolean = false,
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateBetweenExclusive(value, lower, upper, strict)) {
    ctx.throwError(ValidationErrorCode.NOT_BETWEEN_EXCLUSIVE, { 
      lower, 
      upper, 
      actual: value 
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
  strict: boolean = false,
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateMin(value, min, strict)) {
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
  strict: boolean = false,
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateMax(value, max, strict)) {
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
  strict: boolean = false,
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateRange(value, min, max, strict)) {
    ctx.throwError(ValidationErrorCode.NOT_BETWEEN, { 
      lower: min, 
      upper: max, 
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
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
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
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
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
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
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
  options: AssertErrorContextOptions = {}
): void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  if (!validateFalsyConstraint(value)) {
    ctx.throwError(ValidationErrorCode.NOT_FALSY, { value });
  }
}

/**
 * 创建范围断言器
 */
export function createRangeAssert(
  min: any,
  max: any,
  options: AssertErrorContextOptions = {}
): (value: any) => void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  return (value: any): void => {
    if (!validateRange(value, min, max)) {
      ctx.throwError(ValidationErrorCode.NOT_BETWEEN, { 
        lower: min, 
        upper: max, 
        actual: value 
      });
    }
  };
}

/**
 * 创建长度断言器
 */
export function createLengthAssert(
  min: number,
  max: number,
  options: AssertErrorContextOptions = {}
): (value: any) => void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
  return (value: any): void => {
    if (!validateLengthRange(value, min, max)) {
      ctx.throwError(ValidationErrorCode.NOT_BETWEEN, { 
        lower: min, 
        upper: max, 
        actual: getLength(value),
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
  options: AssertErrorContextOptions = {}
): (value: any) => void {
  const { paramName, functionName } = options;
  const ctx = createAssetErrorContext({ paramName, functionName });
  
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