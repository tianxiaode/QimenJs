"use strict";
// 精简到15个核心错误代码，但保持详细的参数接口
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationErrorCode = void 0;
exports.ValidationErrorCode = {
    // === 基础验证 (4个) ===
    REQUIRED: 'VALIDATION_REQUIRED', // 必填
    TYPE_MISMATCH: 'VALIDATION_TYPE_MISMATCH', // 类型不匹配
    INVALID_VALUE: 'VALIDATION_INVALID_VALUE', // 无效值
    // === 范围/约束 (4个) ===
    TOO_SMALL: 'VALIDATION_TOO_SMALL', // 太小/太短/太少
    TOO_LARGE: 'VALIDATION_TOO_LARGE', // 太大/太长/太多
    OUT_OF_RANGE: 'VALIDATION_OUT_OF_RANGE', // 超出范围
    // === 格式/模式 (3个) ===
    INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT', // 格式无效
    PATTERN_MISMATCH: 'VALIDATION_PATTERN_MISMATCH', // 模式不匹配
    NOT_ALLOWED: 'VALIDATION_NOT_ALLOWED', // 不允许
    // === 结构/集合 (2个) ===
    MISSING_FIELD: 'VALIDATION_MISSING_FIELD', // 缺少字段/键
    DUPLICATE: 'VALIDATION_DUPLICATE', // 重复
    // === 条件/逻辑 (2个) ===
    CONDITION_FAILED: 'VALIDATION_CONDITION_FAILED', // 条件失败
    CUSTOM: 'VALIDATION_CUSTOM', // 自定义错误
    // === 密码专用错误代码 ===
    PASSWORD_TOO_SHORT: 'VALIDATION_PASSWORD_TOO_SHORT', // 密码太短
    PASSWORD_MISSING_UPPERCASE: 'VALIDATION_PASSWORD_MISSING_UPPERCASE', // 缺少大写字母
    PASSWORD_MISSING_LOWERCASE: 'VALIDATION_PASSWORD_MISSING_LOWERCASE', // 缺少小写字母
    PASSWORD_MISSING_DIGIT: 'VALIDATION_PASSWORD_MISSING_DIGIT', // 缺少数字
    PASSWORD_MISSING_SPECIAL: 'VALIDATION_PASSWORD_MISSING_SPECIAL', // 缺少特殊字符
};
//# sourceMappingURL=codes.js.map