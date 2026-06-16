/**
 * Validation 包类型导出
 * 
 * 验证规则类型从 schema 包导入
 */

// 从 schema 包导入验证规则类型
export type {
    ValidationRule,
    StringRule,
    NumberRule,
    BooleanRule,
    DateRule,
    ArrayRule,
    ObjectRule,
    PasswordRule,
    CompareRule,
    FileRule,
    SplitRule,
    FormatRule,
    BaseValidationRule,
    ValidationTag,
    CustomValidationFunction,
    PatternSwitches,
} from '@orbitjs/schema';

// 从 schema 包导入枚举（需要作为值使用）
export { ValidationPatternType } from '@orbitjs/schema';

// 本地类型
export * from './context';
export * from './processor';
export * from './validate';
export * from './base';