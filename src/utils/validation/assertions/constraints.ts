import { InvalidInputError } from '../../error';
import { 
  isString, 
  isArray, 
  isObject, 
  isMap, 
  isSet,
  isNumber
} from '../types';

/**
 * 约束断言函数
 * 这些函数用于断言值的各种约束条件，验证失败时抛出 InvalidInputError
 */

/**
 * 断言最小长度
 */
export function assertMinLength(
  value: any,
  min: number,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  let length: number | undefined;
  
  if (isString(value)) {
    length = value.length;
  } else if (isArray(value)) {
    length = value.length;
  } else if (isObject(value)) {
    length = Object.keys(value).length;
  } else if (isMap(value)) {
    length = value.size;
  } else if (isSet(value)) {
    length = value.size;
  }
  
  if (length === undefined) {
    throw new InvalidInputError(
      message || `${paramText} must be a string, array, object, Map, or Set${functionText}`,
      { value, paramName, functionName, expected: 'string, array, object, Map, or Set' } as any
    );
  }
  
  if (length < min) {
    throw new InvalidInputError(
      message || `${paramText} must have at least ${min} items${functionText}`,
      { value, paramName, functionName, min, actual: length } as any
    );
  }
}

/**
 * 断言最大长度
 */
export function assertMaxLength(
  value: any,
  max: number,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  let length: number | undefined;
  
  if (isString(value)) {
    length = value.length;
  } else if (isArray(value)) {
    length = value.length;
  } else if (isObject(value)) {
    length = Object.keys(value).length;
  } else if (isMap(value)) {
    length = value.size;
  } else if (isSet(value)) {
    length = value.size;
  }
  
  if (length === undefined) {
    throw new InvalidInputError(
      message || `${paramText} must be a string, array, object, Map, or Set${functionText}`,
      { value, paramName, functionName, expected: 'string, array, object, Map, or Set' } as any
    );
  }
  
  if (length > max) {
    throw new InvalidInputError(
      message || `${paramText} must have at most ${max} items${functionText}`,
      { value, paramName, functionName, max, actual: length } as any
    );
  }
}

/**
 * 断言长度范围
 */
export function assertLengthRange(
  value: any,
  min: number,
  max: number,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
  assertMinLength(value, min, { paramName, functionName, message });
  assertMaxLength(value, max, { paramName, functionName, message });
}

/**
 * 断言最小值
 */
export function assertMin(
  value: any,
  min: number,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isNumber(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a number${functionText}`,
      { value, paramName, functionName, expected: 'number' } as any
    );
  }
  
  if (value < min) {
    throw new InvalidInputError(
      message || `${paramText} must be at least ${min}${functionText}`,
      { value, paramName, functionName, min, actual: value } as any
    );
  }
}

/**
 * 断言最大值
 */
export function assertMax(
  value: any,
  max: number,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isNumber(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a number${functionText}`,
      { value, paramName, functionName, expected: 'number' } as any
    );
  }
  
  if (value > max) {
    throw new InvalidInputError(
      message || `${paramText} must be at most ${max}${functionText}`,
      { value, paramName, functionName, max, actual: value } as any
    );
  }
}

/**
 * 断言数值范围
 */
export function assertRange(
  value: any,
  min: number,
  max: number,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
  assertMin(value, min, { paramName, functionName, message });
  assertMax(value, max, { paramName, functionName, message });
}

/**
 * 断言值在集合中
 */
export function assertIn(
  value: any,
  collection: any[] | Set<any> | Record<string, any>,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  let found = false;
  
  if (Array.isArray(collection)) {
    found = collection.includes(value);
  } else if (collection instanceof Set) {
    found = collection.has(value);
  } else if (typeof collection === 'object' && collection !== null) {
    found = Object.values(collection).includes(value);
  } else {
    throw new InvalidInputError(
      'Collection must be an array, Set, or object',
      { collection } as any
    );
  }
  
  if (!found) {
    const collectionText = Array.isArray(collection) 
      ? `[${collection.join(', ')}]`
      : collection instanceof Set
        ? `Set(${[...collection].join(', ')})`
        : `{${Object.values(collection).join(', ')}}`;
    
    throw new InvalidInputError(
      message || `${paramText} must be one of: ${collectionText}${functionText}`,
      { value, paramName, functionName, collection } as any
    );
  }
}

/**
 * 断言值不在集合中
 */
export function assertNotIn(
  value: any,
  collection: any[] | Set<any> | Record<string, any>,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  let found = false;
  
  if (Array.isArray(collection)) {
    found = collection.includes(value);
  } else if (collection instanceof Set) {
    found = collection.has(value);
  } else if (typeof collection === 'object' && collection !== null) {
    found = Object.values(collection).includes(value);
  } else {
    throw new InvalidInputError(
      'Collection must be an array, Set, or object',
      { collection } as any
    );
  }
  
  if (found) {
    const collectionText = Array.isArray(collection) 
      ? `[${collection.join(', ')}]`
      : collection instanceof Set
        ? `Set(${[...collection].join(', ')})`
        : `{${Object.values(collection).join(', ')}}`;
    
    throw new InvalidInputError(
      message || `${paramText} must not be one of: ${collectionText}${functionText}`,
      { value, paramName, functionName, collection } as any
    );
  }
}

/**
 * 断言所有条件都满足
 */
export function assertAll(
  value: any,
  validators: ((v: any) => boolean)[],
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
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
}

/**
 * 断言任一条件满足
 */
export function assertAny(
  value: any,
  validators: ((v: any) => boolean)[],
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
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
}

/**
 * 断言条件不满足
 */
export function assertNot(
  value: any,
  validator: (v: any) => boolean,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (validator(value)) {
    throw new InvalidInputError(
      message || `${paramText} must not satisfy the condition${functionText}`,
      { value, paramName, functionName } as any
    );
  }
}

/**
 * 断言值等于某个值
 */
export function assertEqualTo(
  value: any,
  other: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (value !== other) {
    throw new InvalidInputError(
      message || `${paramText} must equal ${other}${functionText}`,
      { value, paramName, functionName, other } as any
    );
  }
}

/**
 * 断言值不等于某个值
 */
export function assertNotEqualTo(
  value: any,
  other: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (value === other) {
    throw new InvalidInputError(
      message || `${paramText} must not equal ${other}${functionText}`,
      { value, paramName, functionName, other } as any
    );
  }
}

/**
 * 断言值严格等于某个值
 */
export function assertStrictEqualTo(
  value: any,
  other: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  assertEqualTo(value, other, options);
}

/**
 * 断言值严格不等于某个值
 */
export function assertStrictNotEqualTo(
  value: any,
  other: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  assertNotEqualTo(value, other, options);
}

/**
 * 断言值大于某个值
 */
export function assertGreaterThan(
  value: any,
  other: number,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isNumber(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a number${functionText}`,
      { value, paramName, functionName, expected: 'number' } as any
    );
  }
  
  if (value <= other) {
    throw new InvalidInputError(
      message || `${paramText} must be greater than ${other}${functionText}`,
      { value, paramName, functionName, min: other, actual: value } as any
    );
  }
}

/**
 * 断言值大于等于某个值
 */
export function assertGreaterThanOrEqualTo(
  value: any,
  other: number,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isNumber(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a number${functionText}`,
      { value, paramName, functionName, expected: 'number' } as any
    );
  }
  
  if (value < other) {
    throw new InvalidInputError(
      message || `${paramText} must be greater than or equal to ${other}${functionText}`,
      { value, paramName, functionName, min: other, actual: value } as any
    );
  }
}

/**
 * 断言值小于某个值
 */
export function assertLessThan(
  value: any,
  other: number,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isNumber(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a number${functionText}`,
      { value, paramName, functionName, expected: 'number' } as any
    );
  }
  
  if (value >= other) {
    throw new InvalidInputError(
      message || `${paramText} must be less than ${other}${functionText}`,
      { value, paramName, functionName, max: other, actual: value } as any
    );
  }
}

/**
 * 断言值小于等于某个值
 */
export function assertLessThanOrEqualTo(
  value: any,
  other: number,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isNumber(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a number${functionText}`,
      { value, paramName, functionName, expected: 'number' } as any
    );
  }
  
  if (value > other) {
    throw new InvalidInputError(
      message || `${paramText} must be less than or equal to ${other}${functionText}`,
      { value, paramName, functionName, max: other, actual: value } as any
    );
  }
}

/**
 * 断言值在指定范围内（包含边界）
 */
export function assertBetween(
  value: any,
  lower: number,
  upper: number,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  assertRange(value, lower, upper, options);
}

/**
 * 断言值在指定范围内（不包含边界）
 */
export function assertBetweenExclusive(
  value: any,
  lower: number,
  upper: number,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!isNumber(value)) {
    throw new InvalidInputError(
      message || `${paramText} must be a number${functionText}`,
      { value, paramName, functionName, expected: 'number' } as any
    );
  }
  
  if (value <= lower || value >= upper) {
    throw new InvalidInputError(
      message || `${paramText} must be between ${lower} and ${upper} (exclusive)${functionText}`,
      { value, paramName, functionName, lower, upper, actual: value } as any
    );
  }
}

/**
 * 断言值为空
 */
export function assertEmpty(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (value === null || value === undefined) {
    return;
  }
  
  if (isString(value)) {
    if (value.trim().length > 0) {
      throw new InvalidInputError(
        message || `${paramText} must be empty${functionText}`,
        { value, paramName, functionName } as any
      );
    }
    return;
  }
  
  if (isArray(value)) {
    if (value.length > 0) {
      throw new InvalidInputError(
        message || `${paramText} must be an empty array${functionText}`,
        { value, paramName, functionName } as any
      );
    }
    return;
  }
  
  if (isObject(value)) {
    if (Object.keys(value).length > 0) {
      throw new InvalidInputError(
        message || `${paramText} must be an empty object${functionText}`,
        { value, paramName, functionName } as any
      );
    }
    return;
  }
  
  if (isMap(value)) {
    if (value.size > 0) {
      throw new InvalidInputError(
        message || `${paramText} must be an empty Map${functionText}`,
        { value, paramName, functionName } as any
      );
    }
    return;
  }
  
  if (isSet(value)) {
    if (value.size > 0) {
      throw new InvalidInputError(
        message || `${paramText} must be an empty Set${functionText}`,
        { value, paramName, functionName } as any
      );
    }
    return;
  }
  
  // 其他类型视为非空
  throw new InvalidInputError(
    message || `${paramText} must be empty${functionText}`,
    { value, paramName, functionName } as any
  );
}

/**
 * 断言值非空
 */
export function assertNotEmpty(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (value === null || value === undefined) {
    throw new InvalidInputError(
      message || `${paramText} must not be null or undefined${functionText}`,
      { value, paramName, functionName } as any
    );
  }
  
  if (isString(value)) {
    if (value.trim().length === 0) {
      throw new InvalidInputError(
        message || `${paramText} must not be empty${functionText}`,
        { value, paramName, functionName } as any
      );
    }
    return;
  }
  
  if (isArray(value)) {
    if (value.length === 0) {
      throw new InvalidInputError(
        message || `${paramText} must not be an empty array${functionText}`,
        { value, paramName, functionName } as any
      );
    }
    return;
  }
  
  if (isObject(value)) {
    if (Object.keys(value).length === 0) {
      throw new InvalidInputError(
        message || `${paramText} must not be an empty object${functionText}`,
        { value, paramName, functionName } as any
      );
    }
    return;
  }
  
  if (isMap(value)) {
    if (value.size === 0) {
      throw new InvalidInputError(
        message || `${paramText} must not be an empty Map${functionText}`,
        { value, paramName, functionName } as any
      );
    }
    return;
  }
  
  if (isSet(value)) {
    if (value.size === 0) {
      throw new InvalidInputError(
        message || `${paramText} must not be an empty Set${functionText}`,
        { value, paramName, functionName } as any
      );
    }
    return;
  }
  
  // 其他类型视为非空
}

/**
 * 断言值为真
 */
export function assertTruthyConstraint(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (!value) {
    throw new InvalidInputError(
      message || `${paramText} must be truthy${functionText}`,
      { value, paramName, functionName } as any
    );
  }
}

/**
 * 断言值为假
 */
export function assertFalsyConstraint(
  value: any,
  options?: {
    paramName?: string;
    functionName?: string;
    message?: string;
  }
): void {
  const { paramName, functionName, message } = options || {};
  
  const paramText = paramName ? `Parameter '${paramName}'` : 'Value';
  const functionText = functionName ? ` in ${functionName}` : '';
  
  if (value) {
    throw new InvalidInputError(
      message || `${paramText} must be falsy${functionText}`,
      { value, paramName, functionName } as any
    );
  }
}

/**
 * 创建范围断言器
 */
export function createRangeAssertion(
  min: number,
  max: number,
  message?: string
) {
  return (
    value: any,
    options?: {
      paramName?: string;
      functionName?: string;
    }
  ): void => {
    const { paramName, functionName } = options || {};
    assertRange(value, min, max, { 
      paramName, 
      functionName, 
      message: message || `${paramName || 'Value'} must be between ${min} and ${max}` 
    });
  };
}

/**
 * 创建长度断言器
 */
export function createLengthAssertion(
  min: number,
  max: number,
  message?: string
) {
  return (
    value: any,
    options?: {
      paramName?: string;
      functionName?: string;
    }
  ): void => {
    const { paramName, functionName } = options || {};
    assertLengthRange(value, min, max, { 
      paramName, 
      functionName, 
      message: message || `${paramName || 'Value'} must have length between ${min} and ${max}` 
    });
  };
}

/**
 * 创建包含断言器
 */
export function createInAssertion(
  collection: any[] | Set<any>,
  message?: string
) {
  return (
    value: any,
    options?: {
      paramName?: string;
      functionName?: string;
    }
  ): void => {
    const { paramName, functionName } = options || {};
    assertIn(value, collection, { 
      paramName, 
      functionName, 
      message: message || `${paramName || 'Value'} must be in the collection` 
    });
  };
}
