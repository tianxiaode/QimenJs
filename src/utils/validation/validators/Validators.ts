import {
  validateString,
  validateNumber,
  validateBoolean,
  validateFunction,
  validateSymbol,
  validateBigInt,
  validatePrimitive,
  validateTruthy,
  validateFalsy,
  validateInteger,
  validatePositiveInteger,
  validateNonNegativeInteger,
  validateFiniteNumber,
  validateNaN,
  validateEqual,
  validateNotEqual,
  validateNil,
  validateNotNil,
  createValidator,
  createConditionalValidator
} from './primitives';

// 从 structures.ts 导出（没有冲突）
import {
  validateArray,
  validateArrayLike,
  validateObject,
  validatePlainObject,
  validateDate,
  validateRegExp,
  validateMap,
  validateSet,
  validatePromise,
  validateError,
  validateTypedArray,
  validateBuffer,
  validateFormData,
  validateURLSearchParams,
  validateFile,
  validateBlob,
  validateEmptyArray,
  validateEmptyObject,
  validateEmptyMap,
  validateEmptySet,
  validateNested
} from './structures';

// 从 constraints.ts 导出（使用别名避免冲突）
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
} from './constraints';

// 从 patterns.ts 导出（没有冲突）
import {
  validatePattern,
  validateEmail,
  validatePhone,
  validateURL,
  validateIPv4,
  validateIPv6,
  validateMAC,
  validateHexColor,
  validateRGBColor,
  validateRGBAColor,
  validateUsername,
  validatePassword,
  validateChineseID,
  validateChinesePostcode,
  validateDateString,
  validateTimeString,
  validateDateTimeString,
  validateJSONString,
  validateBase64,
  validateUUID,
  validateCreditCard,
  createPatternValidator
} from './patterns';

// 从 logic.ts 导出（使用别名避免冲突）
import {
  validateAll,
  validateAny,
  validateNot,
  validateUnless,
  validateIf,
  createAllValidator,
  createAnyValidator,
  createNotValidator,
  createLogicConditionalValidator,
  createChainValidator,
  createTransformedValidator,
  createDefaultingValidator,
  and,
  or,
  not,
  xor,
  ifThen,
  ifThenElse,
  createValidatorFactory,
  createCachedValidator
} from './logic';


// 验证器工具对象
export const Validators = {
  // 基础验证
  string: validateString,
  number: validateNumber,
  boolean: validateBoolean,
  array: validateArray,
  object: validateObject,
  nil: validateNil,
  notNil: validateNotNil,
  truthy: validateTruthy,
  falsy: validateFalsy,
  empty: validateEmpty,
  notEmpty: validateNotEmpty,
  
  // 模式验证
  email: validateEmail,
  phone: validatePhone,
  url: validateURL,
  pattern: validatePattern,
  
  // 约束验证
  minLength: validateMinLength,
  maxLength: validateMaxLength,
  range: validateRange,
  in: validateIn,
  notIn: validateNotIn,
  
  // 逻辑组合
  all: validateAll,
  any: validateAny,
  not: validateNot,
  and,
  or,
  
  // 创建验证器
  createPattern: createPatternValidator,
  createRange: createRangeValidator,
  createLength: createLengthValidator,
  createConditional: createLogicConditionalValidator,
  
  // 工具方法
  withMessage(validator: (v: any) => boolean, message: string) {
    return (value: any) => ({
      valid: validator(value),
      message: validator(value) ? undefined : message
    });
  }
} as const;
