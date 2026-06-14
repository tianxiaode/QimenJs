import { BooleanRule, DateRule, FormatRule, NumberRule, PasswordRule, SplitRule, StringRule, ValidationRule } from '@orbitjs/validation';
import { CacheType } from '../cache';
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
    keyword?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface IBaseSearchParams extends ILocalSearchParams {
    [key: string]: any;
}
export interface IFlatSearchParams extends IBaseSearchParams {
    page?: number;
    pageSize?: number;
}
/**
 * 树形搜索参数（极简扩展）
 */
export interface ITreeSearchParams extends IBaseSearchParams {
    parentId?: string | number | null;
    depth?: number;
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
export type FieldDefinition = (BaseField & (StringRule | FormatRule | SplitRule)) | (BaseField & PasswordRule) | (BaseField & NumberRule) | (BaseField & DateRule) | (BaseField & BooleanRule) | (BaseField & {
    type: 'enum';
    mapping: Record<string, any>;
}) | (BaseField & {
    type: 'object' | 'array';
});
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
    idField?: string;
    nameField?: string;
    createField?: string;
    updateField?: string;
    defaultSort?: string;
    defaultOrder?: 'asc' | 'desc';
    rules?: Record<string, ValidationRule[] | ValidationRule>;
    persistent?: boolean;
    searchFields?: string[];
    cache?: {
        type?: CacheType;
        prefix?: string;
        storage?: any;
    };
    [key: string]: any;
}
/**
 * 普通平铺实体的 Schema
 */
export interface FlatSchema extends BaseSchema {
    isTree: false;
}
/**
 * 树形实体的 Schema
 */
export interface TreeSchema extends BaseSchema {
    isTree: true;
    isLazy: boolean;
    root: any;
    parentIdField?: string;
    childrenField?: string;
    pathField?: string;
    leafField?: string;
    expandedField?: string;
    useFlat?: boolean;
}
export type Schema = FlatSchema | TreeSchema;
export type RegistrSchema = Omit<BaseSchema, 'extends' | 'idtype' | 'mixins' | 'override' | 'fields' | 'rules'> & TreeSchema;
export interface SchemaCache {
    idType?: 'number' | 'string';
    schema: Schema;
    rules: Record<string, ValidationRule[]>;
}
//# sourceMappingURL=schema.d.ts.map