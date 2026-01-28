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
    clientId?: string | number;
}

/**
 * 本地搜索参数：专注于内存中的筛选
 */
export interface ILocalSearchParams {
    keyword?: string;    // 全文检索（通常匹配 name/label 等）
    sortBy?: string;     // 本地排序字段
    sortOrder?: 'asc' | 'desc';
    // 理论上这里不需要 [key: string]: any; 
    // 因为本地过滤逻辑通常是硬编码在 State 里的某个 filter 函数中
}

export interface IBaseSearchParams extends ILocalSearchParams {
    [key: string]: any; // 业务自定义过滤条件 (filters)
}

export interface IFlatSearchParams extends IBaseSearchParams {
    page?: number;
    pageSize?: number;
}

/**
 * 树形搜索参数（极简扩展）
 */
export interface ITreeSearchParams extends IBaseSearchParams {
    parentId?: string | number | null; // 加载特定父节点下的子项
    depth?: number; // 展开深度
    // 注意：这里通常不需要 page/pageSize，除非你做“节点内分页”
}

export type SearchParams = ILocalSearchParams | IFlatSearchParams | ITreeSearchParams;

/**
 * 基础验证规则契约
 */
export interface BaseField {
    name: string;
    label?: string;
    seachable?: boolean;
    defaultValue?: any;
    readonly?: boolean;
    /**
     * 数据映射逻辑：
     * - string: 代表后端原始字段路径（例如 "user_name" 映射到前端的 "name"）
     * - function: 传入整行原始数据，由开发者完全控制返回逻辑（计算、格式化、字典转换）
     */
    mapping?: string | ((data: IEntity) => any);
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

/**
 * 基础 Schema（所有实体共用）
 */
export interface BaseSchema {
    name: string;
    extends?: string;
    idType?: 'number' | 'string';
    mixins?: string[];
    fields?: FieldDefinition[];
    override?: Record<string, Partial<FieldDefinition>>;

    // 核心标识字段映射
    idField?: string;
    nameField?: string;
    createField?: string;
    updateField?: string;

    defaultSort?: string;
    defaultOrder?: 'asc' | 'desc';
    rules?: Record<string, ValidationRule[] | ValidationRule>;

    //是否持久化
    persistent?: boolean;
    searchFields?: string[];
}

/**
 * 普通平铺实体的 Schema
 */
export interface FlatSchema extends BaseSchema {
    isTree: false; // 字面量类型，用于类型辨识
}

/**
 * 树形实体的 Schema
 */
export interface TreeSchema extends BaseSchema {
    isTree: true;
    isLazy: boolean;
    root: any; // 树模型下，root 是必填的
    parentIdField?: string;
    childrenField?: string;
    pathField?: string;
    leafField?: string;
}

// 最终暴露的统一 Schema 类型
export type Schema = FlatSchema | TreeSchema;

export type RegistrSchema = Omit<
    BaseSchema,
    'extends' | 'idtype' | 'mixins' | 'override' | 'fields' | 'rules'
>;

export interface SchemaCache {
    idType?: 'number' | 'string';
    schema: Schema;
    rules: Record<string, ValidationRule[]>;
}
