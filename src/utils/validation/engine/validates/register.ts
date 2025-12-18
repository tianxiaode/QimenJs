// utils/register.ts
import { ValidatorBase } from './ValidatorBase';
import { validateString } from '../core/validators/string';
import { validateEmail } from '../extension/string/email';
import { validateEqual } from '../extension/string/equal';

/**
 * 注册所有验证器
 */
export function registerValidators() {
  ValidatorBase.registerValidator('string', validateString);
  ValidatorBase.registerValidator('email', validateEmail);
  ValidatorBase.registerValidator('equal', validateEqual);
  // 继续添加其他扩展验证规则
}
