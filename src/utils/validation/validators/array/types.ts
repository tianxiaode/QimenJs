import { ValidationErrorCode,ValidationResult } from '../../core';

/**
 * 数组验证规则的配置接口
 */
export interface ArrayValidationOptions<T = any> {
    /** 是否为必填字段 */
    required?: boolean;
    /** 最小长度 */
    minLength?: number;
    /** 最大长度 */
    maxLength?: number;
    /** 精确长度 */
    exactLength?: number;
    /** 允许为空值（null/undefined） */
    nullable?: boolean;
    /** 是否允许空数组 */
    allowEmpty?: boolean;
    /** 自定义错误消息 */
    message?: string | ((errorCode: ValidationErrorCode, value: any) => string);
    /** 数组元素验证规则 */
    itemValidation?: (item: T, index: number) => ValidationResult;
    /** 唯一性验证（根据值） */
    unique?: boolean;
    /** 唯一性验证（根据特定属性） */
    uniqueBy?: (item: T) => any;
    /** 数组排序验证 */
    sorted?: 'asc' | 'desc' | boolean;
    /** 自定义验证函数 */
    custom?: (value: T[]) => ValidationResult;
    /** 数组元素类型验证 */
    itemType?: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function';
    /** 数组元素类型验证函数 */
    itemTypeCheck?: (item: any) => boolean;
    /** 允许的值列表 */
    allowedValues?: T[];
    /** 必须包含的值 */
    mustContain?: T[];
    /** 不能包含的值 */
    mustNotContain?: T[];
    /** 至少包含一个指定值 */
    anyOf?: T[];
}
