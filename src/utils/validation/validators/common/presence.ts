import { isEmpty, ValidationErrorBuilder } from '../../core';
import { PresenceRule } from '../../rules';

export function validatePresence(
  value: any,
  rule: PresenceRule = {},
  context?: any
) {
  const {
    required = false,
    nullable = true,
    empty = true,
  } = rule;

  // 1️⃣ required：必须存在
  if (required) {
    if (value === undefined || value === null) {
      return ValidationErrorBuilder.required(context);
    }
  }

  // 2️⃣ nullable：是否允许 null
  if (value === null && !nullable) {
    return ValidationErrorBuilder.invalid_value(value, context);
  }

  // 3️⃣ empty：是否允许空内容
  if (!empty && isEmpty(value)) {
    return ValidationErrorBuilder.invalid_value(value, context);
  }

  return null;
}