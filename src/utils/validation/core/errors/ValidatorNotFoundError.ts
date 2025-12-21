import { BaseError } from "../../../error";

/**
 * 验证器未找到错误
 * 当找不到对应类型的验证器时抛出
 */
export class ValidatorNotFoundError extends BaseError {
  constructor(
    type: string,
    context?: Record<string, any>
  ) {
    const message = `Validator for rule type "${type}" not found`;
    super(message, 'VALIDATOR_NOT_FOUND', { 
      type,
      ...context 
    });
  }
}