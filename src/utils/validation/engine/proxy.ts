import { ValidationErrorBuilder, ValidationErrorContext, ValidatorBase } from '../core';

/**
 * 创建验证器代理对象
 * 该代理允许通过属性访问的方式调用各种验证器
 * 例如: validator.string, validator.number 等
 */
const createValidatorProxy = () => {
    return new Proxy({} as any, {
        /**
         * Proxy 的 get 陷阱，拦截属性访问
         * @param target - 目标对象
         * @param prop - 被访问的属性名
         */
        get(target, prop: string) {
            // 如果属性存在于目标对象上，直接返回
            if (prop in target) {
                return target[prop];
            }
            
            // 当访问如 .string, .email 等验证器时，
            // 返回一个函数来执行对应的验证逻辑
            return (value: any, rule: any, context: ValidationErrorContext = {}) =>
                ValidatorBase.executeValidator(prop, value, rule, context);
        },
    });
};

/**
 * 创建断言代理对象
 * 该代理允许通过属性访问的方式调用各种断言方法
 * 例如: assert.string, assert.number 等
 * 与 validator 不同的是，验证失败时会抛出异常而不是返回错误
 */
const createAssertProxy = () => {
    return new Proxy({} as any, {
        /**
         * Proxy 的 get 陷阱，拦截属性访问
         * @param target - 目标对象
         * @param prop - 被访问的属性名
         */
        get(target, prop: string) {
            // 如果属性存在于目标对象上，直接返回
            if (prop in target) {
                return target[prop];
            }
            
            // 当访问如 .string, .email 等断言方法时，
            // 返回一个函数来执行验证并在失败时抛出异常
            return (value: any, rule: any, context: ValidationErrorContext = {}) => {
                // 执行验证器
                const result = ValidatorBase.executeValidator(prop, value, rule, context);
                
                // 如果有验证错误，抛出异常
                if (result && result.length > 0) {
                    ValidationErrorBuilder.throwIfAny(value, rule, result, context);
                }
                
                // 验证成功返回 null
                return null;
            };
        },
    });
};

// 创建代理对象实例
// validator 用于返回验证结果
const validator: any = createValidatorProxy();

// assert 用于在验证失败时抛出异常
const assert: any = createAssertProxy();

// 导出验证器和断言对象供外部使用
export { validator, assert };