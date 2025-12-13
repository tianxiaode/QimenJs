import { InvalidInputError } from '../../error';
import { ValidationErrorCode, ValidationErrorParams } from '../rules/error-codes';
import { createAssetErrorContext, AssertErrorContextOptions } from './error-context';
/**
 * 断言函数统一导出
 * 这些函数用于断言值的各种条件，验证失败时抛出 InvalidInputError
 */

// 从断言文件导出基本类型断言
import {
  assertString,
  assertNumber,
  assertBoolean,
  assertFunction,
  assertSymbol,
  assertBigInt,
  assertPrimitive,
  assertTruthy,
  assertFalsy,
  assertInteger,
  assertPositiveInteger,
  assertNonNegativeInteger,
  assertFiniteNumber,
  assertNaN,
  assertEqual,
  assertNotEqual,
  assertNil,
  assertNotNil,
  createAssert,
  createConditionalAssert
} from './primitives';

// 从断言文件导出结构类型断言
import {
  assertArray,
  assertArrayLike,
  assertObject,
  assertPlainObject,
  assertDate,
  assertRegExp,
  assertMap,
  assertSet,
  assertPromise,
  assertError,
  assertTypedArray,
  assertBuffer,
  assertFormData,
  assertURLSearchParams,
  assertFile,
  assertBlob,
  assertEmptyArray,
  assertEmptyObject,
  assertEmptyMap,
  assertEmptySet,
  assertNested,
  createArrayAssert,
  createObjectAssert,
  deepAssert
} from './structures';

// 从断言文件导出约束断言
import {
  assertMinLength,
  assertMaxLength,
  assertLengthRange,
  assertMin,
  assertMax,
  assertRange,
  assertIn,
  assertNotIn,
  assertAllConstraints,
  assertAnyConstraints,
  assertNotConstraints,
  assertEqualTo,
  assertNotEqualTo,
  assertStrictEqualTo,
  assertStrictNotEqualTo,
  assertGreaterThan,
  assertGreaterThanOrEqualTo,
  assertLessThan,
  assertLessThanOrEqualTo,
  assertBetween,
  assertBetweenExclusive,
  assertEmpty,
  assertNotEmpty,
  assertTruthyConstraint,
  assertFalsyConstraint,
  createRangeAssert,
  createLengthAssert,
  createInAssert,
  composeAssertions,
  conditionalAssert
} from './constraints';

// 从断言文件导出模式断言
import {
  assertPattern,
  assertEmail,
  assertPhone,
  assertURL,
  assertIPv4,
  assertIPv6,
  assertMAC,
  assertHexColor,
  assertRGBColor,
  assertRGBAColor,
  assertUsername,
  assertPassword,
  assertChineseID,
  assertChinesePostcode,
  assertDateString,
  assertTimeString,
  assertDateTimeString,
  assertJSONString,
  assertBase64,
  assertUUID,
  assertCreditCard,
  createPatternAssert,
  createUsernameAssert,
  createPasswordAssert,
  assertPatterns,
  conditionalPatternAssert,
  patternValidationChain,
  createPatternValidationChainAssert
} from './patterns';

// 断言工具对象
export const Assert = {
  // 基本类型
  string: assertString,
  number: assertNumber,
  boolean: assertBoolean,
  function: assertFunction,
  symbol: assertSymbol,
  bigint: assertBigInt,
  primitive: assertPrimitive,
  truthy: assertTruthy,
  falsy: assertFalsy,
  integer: assertInteger,
  positiveInteger: assertPositiveInteger,
  nonNegativeInteger: assertNonNegativeInteger,
  finiteNumber: assertFiniteNumber,
  nan: assertNaN,
  equal: assertEqual,
  notEqual: assertNotEqual,
  nil: assertNil,
  notNil: assertNotNil,
  
  // 结构类型
  array: assertArray,
  arrayLike: assertArrayLike,
  object: assertObject,
  plainObject: assertPlainObject,
  date: assertDate,
  regExp: assertRegExp,
  map: assertMap,
  set: assertSet,
  promise: assertPromise,
  error: assertError,
  typedArray: assertTypedArray,
  buffer: assertBuffer,
  formData: assertFormData,
  urlSearchParams: assertURLSearchParams,
  file: assertFile,
  blob: assertBlob,
  emptyArray: assertEmptyArray,
  emptyObject: assertEmptyObject,
  emptyMap: assertEmptyMap,
  emptySet: assertEmptySet,
  nested: assertNested,
  
  // 约束
  minLength: assertMinLength,
  maxLength: assertMaxLength,
  lengthRange: assertLengthRange,
  min: assertMin,
  max: assertMax,
  range: assertRange,
  in: assertIn,
  notIn: assertNotIn,
  allConstraints: assertAllConstraints,
  anyConstraints: assertAnyConstraints,
  notConstraints: assertNotConstraints,
  equalTo: assertEqualTo,
  notEqualTo: assertNotEqualTo,
  strictEqualTo: assertStrictEqualTo,
  strictNotEqualTo: assertStrictNotEqualTo,
  greaterThan: assertGreaterThan,
  greaterThanOrEqualTo: assertGreaterThanOrEqualTo,
  lessThan: assertLessThan,
  lessThanOrEqualTo: assertLessThanOrEqualTo,
  between: assertBetween,
  betweenExclusive: assertBetweenExclusive,
  empty: assertEmpty,
  notEmpty: assertNotEmpty,
  truthyConstraint: assertTruthyConstraint,
  falsyConstraint: assertFalsyConstraint,
  
  // 模式
  pattern: assertPattern,
  email: assertEmail,
  phone: assertPhone,
  url: assertURL,
  ipv4: assertIPv4,
  ipv6: assertIPv6,
  mac: assertMAC,
  hexColor: assertHexColor,
  rgbColor: assertRGBColor,
  rgbaColor: assertRGBAColor,
  username: assertUsername,
  password: assertPassword,
  chineseID: assertChineseID,
  chinesePostcode: assertChinesePostcode,
  dateString: assertDateString,
  timeString: assertTimeString,
  dateTimeString: assertDateTimeString,
  jsonString: assertJSONString,
  base64: assertBase64,
  uuid: assertUUID,
  creditCard: assertCreditCard,
  
  // 高级断言
  deep: deepAssert,
  patterns: assertPatterns,
  compose: composeAssertions,
  
  // 创建断言器
  create: {
    primitive: createAssert,
    conditional: createConditionalAssert,
    range: createRangeAssert,
    length: createLengthAssert,
    in: createInAssert,
    array: createArrayAssert,
    object: createObjectAssert,
    pattern: createPatternAssert,
    username: createUsernameAssert,
    password: createPasswordAssert,
    patternValidationChain: createPatternValidationChainAssert
  },
  
  // 条件断言
  conditional: conditionalAssert,
  conditionalPattern: conditionalPatternAssert,
  
  /**
   * 创建断言上下文
   */
  context: (options?: AssertErrorContextOptions) => createAssetErrorContext(options),
  
  /**
   * 断言条件满足，否则抛出错误
   */
  that(
    condition: boolean,
    message: string,
    params: ValidationErrorParams = {},
    contextOptions?: AssertErrorContextOptions
  ): asserts condition {
    const ctx = createAssetErrorContext(contextOptions);
    
    if (!condition) {
      ctx.throwError(ValidationErrorCode.NOT_SATISFY_CONDITION, {
        ...params,
        _customMessage: message
      });
    }
  },
  
  /**
   * 断言值满足所有条件
   */
  satisfiesAll<T>(
    value: T,
    validators: ((v: T) => boolean)[],
    contextOptions?: AssertErrorContextOptions
  ): asserts value is T {
    const ctx = createAssetErrorContext(contextOptions);
    
    for (let i = 0; i < validators.length; i++) {
      if (!validators[i](value)) {
        ctx.throwError(ValidationErrorCode.ALL_VALIDATIONS_FAILED, { 
          value, 
          validatorIndex: i 
        });
      }
    }
  },
  
  /**
   * 断言值满足任一条件
   */
  satisfiesAny<T>(
    value: T,
    validators: ((v: T) => boolean)[],
    contextOptions?: AssertErrorContextOptions
  ): asserts value is T {
    const ctx = createAssetErrorContext(contextOptions);
    
    for (let i = 0; i < validators.length; i++) {
      if (validators[i](value)) {
        return;
      }
    }
    
    ctx.throwError(ValidationErrorCode.ANY_VALIDATION_FAILED, { 
      value 
    });
  },
  
  /**
   * 断言值不满足条件
   */
  satisfiesNot<T>(
    value: T,
    validator: (v: T) => boolean,
    contextOptions?: AssertErrorContextOptions
  ): asserts value is T {
    const ctx = createAssetErrorContext(contextOptions);
    
    if (validator(value)) {
      ctx.throwError(ValidationErrorCode.NOT_SATISFY_CONDITION, { 
        value 
      });
    }
  },
  
  /**
   * 组合多个断言
   */
  combine<T>(
    ...assertions: ((value: T, contextOptions?: AssertErrorContextOptions) => void)[]
  ): (value: T, contextOptions?: AssertErrorContextOptions) => void {
    return (value: T, contextOptions?: AssertErrorContextOptions): void => {
      for (const assertion of assertions) {
        assertion(value, contextOptions);
      }
    };
  },
  
  /**
   * 可选断言：仅当值不为null或undefined时执行
   */
  optional<T>(
    value: T | null | undefined,
    assertion: (value: T, contextOptions?: AssertErrorContextOptions) => void,
    contextOptions?: AssertErrorContextOptions
  ): void {
    if (value !== null && value !== undefined) {
      assertion(value, contextOptions);
    }
  },
  
  /**
   * 链式断言：按顺序执行断言，第一个失败就停止
   */
  chain<T>(
    ...assertions: ((value: T, contextOptions?: AssertErrorContextOptions) => void)[]
  ): (value: T, contextOptions?: AssertErrorContextOptions) => void {
    return (value: T, contextOptions?: AssertErrorContextOptions): void => {
      for (const assertion of assertions) {
        assertion(value, contextOptions);
      }
    };
  },
  
  /**
   * 安全断言：捕获断言错误并返回错误信息
   */
  safe<T>(
    value: T,
    assertion: (value: T, contextOptions?: AssertErrorContextOptions) => void,
    contextOptions?: AssertErrorContextOptions
  ): { success: boolean; error?: InvalidInputError } {
    try {
      assertion(value, contextOptions);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error as InvalidInputError 
      };
    }
  }
} as const;

// 导出类型
export type {
  AssertErrorContextOptions,
  ValidationErrorParams,
  ValidationErrorCode
};

// 导出错误上下文创建函数
export { createAssetErrorContext };

// 导出Assert类型
export type Assert = typeof Assert;