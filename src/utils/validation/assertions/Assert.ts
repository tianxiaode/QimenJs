import { InvalidInputError } from '../../error';
/**
 * 断言函数统一导出
 * 这些函数用于断言值的各种条件，验证失败时抛出 InvalidInputError
 */

// 从 primitives.ts 导出基本类型断言
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
  createAssertion as createPrimitiveAssertion
} from './primitives';

// 从 structures.ts 导出结构类型断言
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
  assertNested
} from './structures';

// 从 constraints.ts 导出约束断言
import {
  assertMinLength,
  assertMaxLength,
  assertLengthRange,
  assertMin,
  assertMax,
  assertRange,
  assertIn,
  assertNotIn,
  assertAll,
  assertAny,
  assertNot,
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
  createRangeAssertion,
  createLengthAssertion,
  createInAssertion
} from './constraints';

// 从 patterns.ts 导出模式断言
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
  createPatternAssertion
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
  all: assertAll,
  any: assertAny,
  not: assertNot,
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
  
  // 创建断言器
  create: {
    primitive: createPrimitiveAssertion,
    range: createRangeAssertion,
    length: createLengthAssertion,
    in: createInAssertion,
    pattern: createPatternAssertion
  },
  
  /**
   * 断言条件满足，否则抛出错误
   */
  that(
    condition: boolean,
    message: string,
    context?: Record<string, any>
  ): asserts condition {
    if (!condition) {
      throw new InvalidInputError(message, context);
    }
  },
  
  /**
   * 断言值满足所有条件
   */
  satisfiesAll<T>(
    value: T,
    validators: ((v: T) => boolean)[],
    message?: string,
    paramName?: string,
    functionName?: string
  ): asserts value is T {
    const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
    const functionText = functionName ? ` in ${functionName}` : '';
    
    for (let i = 0; i < validators.length; i++) {
      if (!validators[i](value)) {
        throw new InvalidInputError(
          message || `${paramText} failed validation at index ${i}${functionText}`,
          { value, paramName, functionName, validatorIndex: i } as any
        );
      }
    }
  },
  
  /**
   * 断言值满足任一条件
   */
  satisfiesAny<T>(
    value: T,
    validators: ((v: T) => boolean)[],
    message?: string,
    paramName?: string,
    functionName?: string
  ): asserts value is T {
    const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
    const functionText = functionName ? ` in ${functionName}` : '';
    
    for (const validator of validators) {
      if (validator(value)) {
        return;
      }
    }
    
    throw new InvalidInputError(
      message || `${paramText} failed all validations${functionText}`,
      { value, paramName, functionName } as any
    );
  },
  
  /**
   * 组合多个断言
   */
  combine<T>(
    ...assertions: ((value: T, paramName?: string, functionName?: string) => void)[]
  ): (value: T, paramName?: string, functionName?: string) => void {
    return (value: T, paramName?: string, functionName?: string): void => {
      for (const assertion of assertions) {
        assertion(value, paramName, functionName);
      }
    };
  }
} as const;
