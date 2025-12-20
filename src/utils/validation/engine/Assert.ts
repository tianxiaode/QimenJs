// core/assert.ts
import { ValidatorBase } from '../core/ValidatorBase';
import { ValidationError} from '../core';

class Assert extends ValidatorBase {
  /**
   * 执行验证并抛出错误（如果失败）
   * @param key 验证规则类型
   * @param value 要验证的值
   * @param rule 验证规则
   * @throws ValidationError 异常
   */
  public assert<T>(key: string, value: any, rule: T): void {
    const errors = ValidatorBase.executeValidator(key, value, rule);
    if (errors && errors.length > 0) {
      throw new ValidationError('Validation failed', 'VALIDATION_FAILED', errors, { value, rule });
    }
  }
}
