// utils/ValidatorBase.ts
class ValidatorBase {
  private static validators: Record<string, (value: any, rule: any) => ValidationRuleError[] | null> = {};

  /**
   * 注册验证器
   * @param key 验证器的唯一标识
   * @param validator 验证器函数
   */
  public static registerValidator(key: string, validator: (value: any, rule: any) => ValidationRuleError[] | null) {
    this.validators[key] = validator;
  }

  /**
   * 获取验证器
   * @param key 验证器的唯一标识
   * @returns 验证器函数
   */
  public static getValidator(key: string): (value: any, rule: any) => ValidationRuleError[] | null {
    return this.validators[key];
  }

  /**
   * 执行验证
   * @param key 验证器的唯一标识
   * @param value 验证的值
   * @param rule 验证规则
   * @returns 错误信息或null
   */
  public static executeValidator(key: string, value: any, rule: any): ValidationRuleError[] | null {
    const validator = this.getValidator(key);
    return validator ? validator(value, rule) : null;
  }
}

export { ValidatorBase };
