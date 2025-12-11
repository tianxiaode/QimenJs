/**
 * 逻辑验证函数
 * 这些函数用于组合多个验证器，实现复杂的逻辑验证
 */

/**
 * 验证所有条件都满足
 * @param value 要验证的值
 * @param validators 验证器数组
 */
export function validateAll(value: any, validators: ((v: any) => boolean)[]): boolean {
  return validators.every(validator => validator(value));
}

/**
 * 验证任一条件满足
 * @param value 要验证的值
 * @param validators 验证器数组
 */
export function validateAny(value: any, validators: ((v: any) => boolean)[]): boolean {
  return validators.some(validator => validator(value));
}

/**
 * 验证条件不满足
 * @param value 要验证的值
 * @param validator 验证器
 */
export function validateNot(value: any, validator: (v: any) => boolean): boolean {
  return !validator(value);
}

/**
 * 验证条件满足，除非满足例外条件
 * @param value 要验证的值
 * @param validator 主验证器
 * @param exceptValidator 例外验证器
 */
export function validateUnless(
  value: any,
  validator: (v: any) => boolean,
  exceptValidator: (v: any) => boolean
): boolean {
  return exceptValidator(value) || validator(value);
}

/**
 * 验证条件满足，如果满足前提条件
 * @param value 要验证的值
 * @param validator 主验证器
 * @param conditionValidator 条件验证器
 */
export function validateIf(
  value: any,
  validator: (v: any) => boolean,
  conditionValidator: (v: any) => boolean
): boolean {
  return !conditionValidator(value) || validator(value);
}

/**
 * 验证所有给定的验证器都对值返回 true
 * @param validators 验证器数组
 */
export function createAllValidator(validators: ((v: any) => boolean)[]) {
  return (value: any): boolean => validateAll(value, validators);
}

/**
 * 验证任一给定的验证器对值返回 true
 * @param validators 验证器数组
 */
export function createAnyValidator(validators: ((v: any) => boolean)[]) {
  return (value: any): boolean => validateAny(value, validators);
}

/**
 * 创建否定验证器
 * @param validator 要否定的验证器
 */
export function createNotValidator(validator: (v: any) => boolean) {
  return (value: any): boolean => validateNot(value, validator);
}

/**
 * 创建条件验证器（逻辑版本）
 * 与 primitives.ts 中的 createConditionalValidator 功能不同，这里是逻辑组合版本
 */
export function createLogicConditionalValidator(
  conditionValidator: (v: any) => boolean,
  trueValidator: (v: any) => boolean,
  falseValidator: (v: any) => boolean = () => true
) {
  return (value: any): boolean => {
    return conditionValidator(value) 
      ? trueValidator(value)
      : falseValidator(value);
  };
}

/**
 * 创建链式验证器
 * @param validators 验证器数组，按顺序执行
 * @param stopOnFailure 遇到失败时是否停止（默认为 true）
 */
export function createChainValidator(
  validators: ((v: any) => boolean)[],
  stopOnFailure: boolean = true
) {
  return (value: any): boolean => {
    for (const validator of validators) {
      const result = validator(value);
      if (stopOnFailure && !result) {
        return false;
      }
      if (!stopOnFailure && !result) {
        // 继续执行但不计入最终结果
        continue;
      }
    }
    return true;
  };
}

/**
 * 创建带转换的验证器
 * @param transformer 值转换函数
 * @param validator 验证器
 */
export function createTransformedValidator<T, R>(
  transformer: (value: T) => R,
  validator: (value: R) => boolean
) {
  return (value: T): boolean => {
    const transformed = transformer(value);
    return validator(transformed);
  };
}

/**
 * 创建带默认值的验证器
 * @param validator 验证器
 * @param defaultValue 默认值
 */
export function createDefaultingValidator(
  validator: (v: any) => boolean,
  defaultValue: any
) {
  return (value: any): boolean => {
    const actualValue = value === undefined ? defaultValue : value;
    return validator(actualValue);
  };
}

/**
 * 验证器组合：与（AND）操作
 */
export function and<T>(
  ...validators: ((value: any) => boolean)[]
): (value: T) => boolean {
  return (value: T): boolean => validateAll(value, validators);
}

/**
 * 验证器组合：或（OR）操作
 */
export function or<T>(
  ...validators: ((value: any) => boolean)[]
): (value: T) => boolean {
  return (value: T): boolean => validateAny(value, validators);
}

/**
 * 验证器组合：非（NOT）操作
 */
export function not<T>(
  validator: (value: T) => boolean
): (value: T) => boolean {
  return (value: T): boolean => validateNot(value, validator);
}

/**
 * 验证器组合：异或（XOR）操作
 * 当且仅当恰好一个验证器返回 true 时通过
 */
export function xor<T>(
  ...validators: ((value: T) => boolean)[]
): (value: T) => boolean {
  return (value: T): boolean => {
    let trueCount = 0;
    for (const validator of validators) {
      if (validator(value)) {
        trueCount++;
        if (trueCount > 1) {
          return false;
        }
      }
    }
    return trueCount === 1;
  };
}

/**
 * 验证器组合：如果-那么（IF-THEN）操作
 */
export function ifThen<T>(
  condition: (value: T) => boolean,
  thenValidator: (value: T) => boolean
): (value: T) => boolean {
  return (value: T): boolean => validateIf(value, thenValidator, condition);
}

/**
 * 验证器组合：如果-那么-否则（IF-THEN-ELSE）操作
 */
export function ifThenElse<T>(
  condition: (value: T) => boolean,
  thenValidator: (value: T) => boolean,
  elseValidator: (value: T) => boolean
): (value: T) => boolean {
  return (value: T): boolean => {
    return condition(value) ? thenValidator(value) : elseValidator(value);
  };
}

/**
 * 创建验证器工厂，根据条件返回不同的验证器
 */
export function createValidatorFactory<T>(
  factory: (value: T) => ((value: T) => boolean) | null
): (value: T) => boolean {
  return (value: T): boolean => {
    const validator = factory(value);
    return validator ? validator(value) : true;
  };
}

/**
 * 创建带缓存的验证器
 * @param validator 原始验证器
 * @param cacheSize 缓存大小（默认为 100）
 */
export function createCachedValidator(
  validator: (v: any) => boolean,
  cacheSize: number = 100
): (v: any) => boolean {
  const cache = new Map<any, boolean>();
  
  return (value: any): boolean => {
    // 对于原始值，直接使用值作为键
    const key = typeof value === 'object' && value !== null
      ? Symbol.for('object') // 对象使用特殊键，因为引用可能不同
      : value;
    
    if (cache.has(key)) {
      // LRU: 将访问的项移到最后（最近使用）
      const result = cache.get(key)!;
      cache.delete(key);  // 先删除
      cache.set(key, result);  // 再添加到末尾
      return result;
    }
    
    const result = validator(value);
    
    // 更新缓存
    cache.set(key, result);
    
    // 如果缓存已满，移除最旧的条目（Map的第一个元素）
    if (cache.size > cacheSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
}