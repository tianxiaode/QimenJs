// core/validator.ts
import { ValidationRuleError } from '../core';
import { ValidatorBase } from './ValidatorBase';

class Validator extends ValidatorBase {
  constructor() {
    super();
  }

  /**
   * 执行验证
   * @param key 验证规则类型
   * @param value 要验证的值
   * @param rule 验证规则
   * @returns 验证错误
   */
  public validate<T>(key: string, value: any, rule: T): ValidationRuleError[] | null {
    return ValidatorBase.executeValidator(key, value, rule);
  }
}
