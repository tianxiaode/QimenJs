import { createError, ValidationErrorCode, ValidatorResult } from "../../core";
import { StringRule } from "../../rules";

/**
 * 验证值是否为必填项
 * 检查给定值是否为 null 或 undefined，如果是则返回验证错误
 * 
 * @param value - 需要验证的值
 * @param path - 验证路径，用于标识验证字段的位置（可选）
 * @returns 如果值为 null 或 undefined 返回 ValidationError，否则返回 null 表示验证通过
 */
export function validateStringRequired(
  value: any,
  _rule: StringRule,
  path?: string
): ValidatorResult {
  // 检查值是否为 null 或 undefined
  if (value === null || value === undefined) {
    // 如果是，则创建并返回必填错误
    return createError(ValidationErrorCode.REQUIRED, { path })
  }
  // 验证通过，返回 null
  return null
}