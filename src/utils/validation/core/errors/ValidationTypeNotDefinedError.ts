import { BaseError } from "../../../error";

/**
 * 验证规则错误
 * 当验证规则配置不正确时抛出
 */
export class ValidationTypeNotDefinedError extends BaseError {
  constructor(
    message: string,
    context?: Record<string, any>
  ) {
    super(message, 'VALIDATION_RULE_ERROR', context);
  }
}
