// validation/error-codes/core.ts

/**
 * 核心验证错误代码 - 基于最常见的字段验证错误
 * 约15-20个，覆盖90%的使用场景
 */
export const ValidationErrorCode = {
  // === 必填/存在性 (3个) ===
  REQUIRED: 'VALIDATION_REQUIRED',           // 字段必填
  NULL_OR_UNDEFINED: 'VALIDATION_NULL_OR_UNDEFINED', // 不能为null/undefined
  EMPTY: 'VALIDATION_EMPTY',                 // 不能为空（字符串/数组/对象）
  
  // === 类型错误 (2个) ===
  TYPE_MISMATCH: 'VALIDATION_TYPE_MISMATCH', // 类型不匹配
  INVALID_VALUE: 'VALIDATION_INVALID_VALUE', // 无效的值
  
  // === 范围/约束 (4个) ===
  TOO_SMALL: 'VALIDATION_TOO_SMALL',         // 太小/太短/太少
  TOO_LARGE: 'VALIDATION_TOO_LARGE',         // 太大/太长/太多
  OUT_OF_RANGE: 'VALIDATION_OUT_OF_RANGE',   // 超出范围
  NOT_BETWEEN: 'VALIDATION_NOT_BETWEEN',     // 不在指定范围内
  
  // === 格式/模式 (3个) ===
  INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT', // 格式无效
  PATTERN_MISMATCH: 'VALIDATION_PATTERN_MISMATCH', // 模式不匹配
  NOT_ALLOWED: 'VALIDATION_NOT_ALLOWED',      // 不允许的值/字符
  
  // === 比较/关系 (3个) ===
  NOT_EQUAL: 'VALIDATION_NOT_EQUAL',         // 不相等
  NOT_MATCH: 'VALIDATION_NOT_MATCH',         // 不匹配（如确认密码）
  CONFLICT: 'VALIDATION_CONFLICT',           // 冲突/重复
  
  // === 结构/逻辑 (4个) ===
  MISSING_FIELD: 'VALIDATION_MISSING_FIELD', // 缺少字段
  INVALID_STRUCTURE: 'VALIDATION_INVALID_STRUCTURE', // 结构无效
  CONDITION_FAILED: 'VALIDATION_CONDITION_FAILED', // 条件不满足
  CUSTOM: 'VALIDATION_CUSTOM',               // 自定义错误
} as const;

export type ValidationErrorCode = typeof ValidationErrorCode[keyof typeof ValidationErrorCode];