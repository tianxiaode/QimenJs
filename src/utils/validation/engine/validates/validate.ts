// core/validator.ts
import { StringRuleOptions, EmailRule, ValidationRuleError } from '../../rules';
import { validateString } from '../../validators';
import { validateEmail } from './string';

// 定义验证函数签名类型
type ValidatorFn<T> = (value: any, rule: T) => ValidationRuleError[] | null;

// 验证规则映射表类型
type ValidatorMap = {
  string: ValidatorFn<StringRuleOptions>;
  email: ValidatorFn<EmailRule>;
  // 可以继续扩展其他内置类型
};

class Validator {
  private map: ValidatorMap;

  constructor() {
    // 初始化内置规则
    this.map = {
      string: validateString,
      email: validateEmail,
    };
  }

  /**
   * 执行验证
   * @param key 验证规则类型
   * @param value 要验证的值
   * @param rule 验证规则
   */
  public validate<T>(key: keyof ValidatorMap, value: any, rule: T): ValidationRuleError[] | null {
    const validator = this.map[key];
    if (!validator) {
      throw new Error(`Validator for key "${key}" not found.`);
    }
    return validator(value, rule);
  }

  /**
   * 动态注册验证规则
   * 如果规则已存在，则替换
   * @param key 验证规则类型
   * @param validator 验证函数
   */
  public register<T>(key: keyof ValidatorMap, validator: ValidatorFn<T>): void {
    this.map[key] = validator;
  }
}

// 实例化验证器
const validator = new Validator();

// 使用内置验证规则
const stringErrors = validator.validate('string', 'test', { required: true, minLength: 3 });
console.log(stringErrors);  // 输出验证错误

const emailErrors = validator.validate('email', 'test@domain.com', { required: true });
console.log(emailErrors);  // 输出验证错误

// 动态注册自定义验证规则
validator.register('custom', (value: any, rule: any) => {
  if (value < 10) {
    return [{ message: 'Custom validation failed', code: 'VALIDATION_FAILED' }];
  }
  return null;
});

// 使用自定义验证
const customErrors = validator.validate('custom', 5, {});
console.log(customErrors);  // 输出自定义验证错误

// 替换现有的验证规则
validator.register('string', (value: any, rule: StringRuleOptions) => {
  if (value.length < 10) {
    return [{ message: 'Custom string validation failed', code: 'VALIDATION_FAILED' }];
  }
  return null;
});

// 使用替换后的验证规则
const replacedStringErrors = validator.validate('string', 'short', { required: true });
console.log(replacedStringErrors);  // 输出替换后的验证错误
