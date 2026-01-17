import {
    BooleanRule,
    DateRule,
    FormatRule,
    NumberRule,
    PasswordRule,
    SplitRule,
    StringRule,
    ValidationRule,
} from '@orbitjs/validation';

/**
 * 基础实体接口，所有业务 Model 的基石
 */
export interface IEntity {
    id?: string | number;
    [key: string]: any;
}

/**
 * 基础验证规则契约
 */

export interface BaseField {
    name: string;
    label?: string;
    source?: string;
    defaultValue?: any;
    readonly?: boolean;
    mapping?: string;
    rules?: ValidationRule | ValidationRule[];
}

export type FieldDefinition =
    | (BaseField & (StringRule | FormatRule | SplitRule)) // 字符串及变体
    | (BaseField & PasswordRule) // 字符串及变体
    | (BaseField & NumberRule) // 数字
    | (BaseField & DateRule) // 日期
    | (BaseField & BooleanRule) // 布尔
    | (BaseField & { type: 'enum'; mapping: Record<string, any> }) // 枚举特有
    | (BaseField & { type: 'object' | 'array' }); // 复杂类型只留标识

export interface Schema {
    name: string;

    /** 继承：只能继承自一个父 Schema，获取其 keys、behavior 和 schema */
    extends?: string;
    idType?: 'number' | 'string';

    /** 组合：引用多个公共字段集 (Schema Templates) */
    mixins?: string[];

    /** 扩展：当前实体特有的字段 */
    fields?: FieldDefinition[];

    /** 覆盖：对 extends 或 mixins 中同名字段的精准修正 */
    override?: Record<string, Partial<FieldDefinition>>;

    // --- 身份标识 (Keys) ---
    idKey?: string; // 默认 'id'
    labelKey?: string; // 默认 'name'
    createdAtKey?: string; // 默认 'createdAt'
    updatedAtKey?: string; // 默认 'updatedAt'

    // --- 列表行为 (Behavior) ---
    filters?: string[]; // 或者叫 filterList，建议用 filters，更简洁且符合复数习惯
    defaultSort?: string; // 默认排序字段，如 'createdAt'
    defaultOrder?: 'asc' | 'desc'; // 默认排序方向

    rules?: Record<string, ValidationRule[] | ValidationRule>;
}

export type RegistrSchema = Omit<Schema, 'extends' | 'mixins' | 'override' | 'fileds' | 'rules'>;

export interface SchemaCache {
    idType?: 'number' |'string';
    schema: Schema;
    rules: Record<string, ValidationRule[]>;
}
