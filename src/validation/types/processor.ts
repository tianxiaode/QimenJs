import { ValidationContext } from './context';

/** * 基础类型定义
 */
export const VALID_TYPES = [
    'string',
    'number',
    'boolean',
    'date',
    'array',
    'object',
    'password',
] as const;

/** * 导出类型，方便其他地方做类型约束
 */
export type ValidationTag = (typeof VALID_TYPES)[number];

/** * 预定义的全类型数组
 * 专门给 required, default, nullable 等“通吃型”处理器使用
 */
export const ALL_TAGS: ValidationTag[] = [...VALID_TYPES];

export type ValidationProcessorHandler = (ctx: ValidationContext) => Promise<void>;

/**
 * 验证阶段基准权重
 * 数值越小，执行越早
 */
export enum ValidationWeight {
    /** 准备阶段：填充默认值、初步物理转换 (default, transform, trim) */
    PREPARATION = 0,

    /** 存在性检查：拦截必填或放行空值 (required, nullable) */
    PRESENCE = 1000,

    /** 类型与格式：基础身份校验 (type, format, pattern) */
    SEMANTIC = 2000,

    /** 物理约束：数值大小、长度、正则 (min, max, exact) */
    QUANTITY = 3000,

    /** 逻辑关联：枚举、跨字段比对 (enum, operator, target) */
    RELATION = 4000,

    /** 结构递归：对象属性、数组项 (properties, children) */
    STRUCTURAL = 5000,
}

export interface ValidationProcessorEntry {
    /** 处理器名称，对应 ValidationRule 中的 Key */
    name: string;
    /** 所属阶段基准 */
    weight: ValidationWeight;
    /** 阶段内偏移量，默认 0 */
    offset: number;
    /** 核心执行函数 */
    execute: ValidationProcessorHandler;
    tags: ValidationTag[];
}
