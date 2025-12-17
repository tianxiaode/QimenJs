// src/utils/validation/validators/object-validator.ts
import { ObjectValidationOptions } from './types';
import {
  ValidationErrorCode,
  ValidationResult,
  createValidationSuccess,
  createValidationFailure,
  assertValidation,
} from '../../core';
import { isObject } from '../../rules';

/**
 * 验证对象
 */
export async function validateObject<T = Record<string, any>>(
  value: any,
  options: ObjectValidationOptions<T> = {}
): Promise<ValidationResult> {
  const defaultOptions: ObjectValidationOptions<T> = {
    required: false,
    nullable: false,
    allowEmpty: true,
    strict: false,
    ...options,
  };

  // 1. 空值处理
  if (value == null) {
    if (defaultOptions.nullable) {
      return createValidationSuccess();
    }
    if (defaultOptions.required) {
      return createValidationFailure(ValidationErrorCode.REQUIRED, {
        value,
        options: defaultOptions,
      });
    }
    return createValidationSuccess();
  }

  // 2. 类型检查 - 使用 isObject
  const typeResult = isObject(value);
  if (!typeResult.isValid) {
    return typeResult;
  }

  const objValue = value as T;
  const objKeys = Object.keys(objValue as any);

  // 3. 空对象检查
  if (!defaultOptions.allowEmpty && objKeys.length === 0) {
    return createValidationFailure(ValidationErrorCode.NOT_EMPTY, {
      value,
      options: defaultOptions,
    });
  }

  // 4. 必需属性检查
  if (defaultOptions.requiredProperties && defaultOptions.requiredProperties.length > 0) {
    const missingKeys = defaultOptions.requiredProperties.filter(
      (key) => !objKeys.includes(String(key))
    );
    if (missingKeys.length > 0) {
      return createValidationFailure(ValidationErrorCode.REQUIRED_PROPERTY_MISSING, {
        value,
        options: defaultOptions,
        missingKeys,
      });
    }
  }

  // 5. 禁止属性检查
  if (defaultOptions.forbiddenProperties && defaultOptions.forbiddenProperties.length > 0) {
    const presentKeys = defaultOptions.forbiddenProperties.filter(
      (key) => objKeys.includes(String(key))
    );
    if (presentKeys.length > 0) {
      return createValidationFailure(ValidationErrorCode.FORBIDDEN_PROPERTY_PRESENT, {
        value,
        options: defaultOptions,
        presentKeys,
      });
    }
  }

  // 6. 属性验证
  if (defaultOptions.properties) {
    for (const [key, validator] of Object.entries(defaultOptions.properties)) {
      if (objKeys.includes(key)) {
        const propertyValue = objValue[key as keyof T];
        const result = await validator(propertyValue);
        
        if (!result.isValid) {
          return result;
        }
      }
    }
  }

  // 7. 自定义验证
  if (defaultOptions.custom) {
    const customResult = await defaultOptions.custom(objValue);
    if (!customResult.isValid) {
      return customResult;
    }
  }

  // 8. 严格模式检查
  if (defaultOptions.strict && defaultOptions.allowedProperties) {
    const extraKeys = objKeys.filter(
      (key) => !defaultOptions.allowedProperties!.includes(key)
    );
    if (extraKeys.length > 0) {
      return createValidationFailure(ValidationErrorCode.EXTRA_PROPERTIES, {
        value,
        options: defaultOptions,
        extraKeys,
      });
    }
  }

  // 9. 白名单检查
  if (defaultOptions.allowedProperties && defaultOptions.allowedProperties.length > 0) {
    const invalidKeys = objKeys.filter(
      (key) => !defaultOptions.allowedProperties!.includes(key)
    );
    if (invalidKeys.length > 0) {
      return createValidationFailure(ValidationErrorCode.PROPERTY_NOT_ALLOWED, {
        value,
        options: defaultOptions,
        invalidKeys,
      });
    }
  }

  // 10. 黑名单检查
  if (defaultOptions.disallowedProperties && defaultOptions.disallowedProperties.length > 0) {
    const forbiddenKeys = objKeys.filter(
      (key) => defaultOptions.disallowedProperties!.includes(key)
    );
    if (forbiddenKeys.length > 0) {
      return createValidationFailure(ValidationErrorCode.PROPERTY_DISALLOWED, {
        value,
        options: defaultOptions,
        forbiddenKeys,
      });
    }
  }

  // 11. 实例类型检查
  if (defaultOptions.instanceOf && !(objValue instanceof defaultOptions.instanceOf)) {
    return createValidationFailure(ValidationErrorCode.INSTANCEOF_FAILED, {
      value,
      options: defaultOptions,
      expectedInstance: defaultOptions.instanceOf.name,
    });
  }

  // 12. 依赖关系检查
  if (defaultOptions.dependencies && defaultOptions.dependencies.length > 0) {
    for (const dependency of defaultOptions.dependencies) {
      const conditionKey = String(dependency.if);
      if (objKeys.includes(conditionKey)) {
        const missingDeps = dependency.then.filter(
          (depKey) => !objKeys.includes(String(depKey))
        );
        if (missingDeps.length > 0) {
          return createValidationFailure(ValidationErrorCode.DEPENDENCY_MISSING, {
            value,
            options: defaultOptions,
            conditionKey,
            missingDeps,
          });
        }
      }
    }
  }

  return createValidationSuccess();
}

/**
 * 断言对象
 */
export async function assertObject<T = Record<string, any>>(
  value: any,
  options: ObjectValidationOptions<T>,
  context?: Record<string, any>
): Promise<T> {
  const result = await validateObject(value, options);
  assertValidation(result, context);
  
  return value as T;
}