import { ValidationErrorCode,ValidationResult } from '../../core';

/**
 * 日期验证规则的配置接口
 */
export interface DateValidationOptions {
  /** 是否为必填字段 */
  required?: boolean;
  /** 允许为空值（null/undefined） */
  nullable?: boolean;
  /** 自定义错误消息 */
  message?: string | ((errorCode: ValidationErrorCode, value: any) => string);
  /** 最小日期 */
  min?: Date | string | number;
  /** 最大日期 */
  max?: Date | string | number;
  /** 日期范围 */
  range?: [min: Date | string | number, max: Date | string | number];
  /** 自定义验证函数 */
  custom?: (value: Date) => ValidationResult;
  /** 是否为过去日期 */
  past?: boolean;
  /** 是否为将来日期 */
  future?: boolean;
  /** 是否为今天 */
  today?: boolean;
  /** 是否允许无效日期 */
  allowInvalid?: boolean;
  /** 日期格式（字符串解析） */
  format?: string;
  /** 严格模式（必须是 Date 实例） */
  strict?: boolean;
  /** 时区处理 */
  timezone?: 'UTC' | 'local' | string;
  /** 日期精度 */
  precision?: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond';
  /** 工作日验证 */
  weekday?: number | number[]; // 0-6 (周日-周六)
  /** 排除的日期 */
  excludedDates?: Array<Date | string | number>;
  /** 允许的日期 */
  allowedDates?: Array<Date | string | number>;
}
