import { validate } from '../validates/validate';
import { ValidationRuleError } from '../../core';
import { createError } from './error';

/**
 * createAssert 用于创建一个验证函数
 * @param fn 验证函数
 * @returns 一个封装了错误检查的函数
 */
function createAssert<T>(fn: (value: any, rule: T) => ValidationRuleError[] | null) {
  return (value: any, rule: T, context?: any) => {
    const errors = fn(value, rule);
    if (errors && errors.length > 0) {
      createError(value, rule, errors as ValidationRuleError[], context);  // 如果验证失败，抛出错误
    }
  };
}

const assert = {
  // 字符串验证
  string: () => createAssert(validate.string),

  // 邮箱验证
  email: () => createAssert(validate.email),
  
};

export { assert };
