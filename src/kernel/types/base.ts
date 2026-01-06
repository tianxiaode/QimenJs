import { CompareOperator, ValidationErrorContext } from "@orbitjs/validation";

export type CRUD_ACTION =
    | 'list' // GET_LIST
    | 'all' // GET_ALL
    | 'detail' // GET_DETAIL
    | 'create' // CREATE
    | 'update' // UPDATE
    | 'delete' // DELETE
    | 'batchDelete' // BATCH_DELETE
    | 'toggle'; // TOGGLE

export type ENTITY_ACTION = CRUD_ACTION | string;

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
export interface ValidationRule {
    // 规则类型：预设常用类型 + 自定义类型
    type: 'compare' | 'boolean' | 'boolean' | 'date' | 'currency' | 'enum' | 'nested' | string;

    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    exactLength?: number;

    pattern?: string;

    required?: boolean;
    nullable?: boolean;    
    empty?: boolean;

    enum?: any[];

    trim?: boolean;
    ttrimInner?: boolean;
    trimNewline?: boolean;

    //字符串分隔符拆分验证
    separator: string | RegExp;
    minItems?: number;
    maxItems?: number;
    allowEmptyItem?: boolean;

    //数字相关
    exclusiveMin?: number;
    exclusiveMax?: number;
    integer?: boolean;
    positive?: boolean;
    negative?: boolean;
    odd?: number;
    even?: number;
    allowsValues?: number[];
    disallowsValues?: number[];

    //比较验证规则
    operator: CompareOperator;
    target: unknown | ((ctx?: ValidationErrorContext) => unknown);
    strict?: boolean;
    transform?: (value: any) => any;

    // 错误反馈：校验失败时抛出的文案
    message: string;
}

export interface FieldMapping {
    name: string; // 前端使用的字段名
    source?: string; // 后端原始字段名（如果不填，默认同 name）
    type: 'string' | 'number' | 'boolean' | 'date' | 'currency' | 'enum' | 'nested';
    format?: string; // 格式化参数
    defaultValue?: any;
    mapping?: Record<any, any>;
    // 甚至可以加上权限或者 UI 描述
    label?: string;
    readonly?: boolean;
}

export type EntitySchema = FieldMapping[];
