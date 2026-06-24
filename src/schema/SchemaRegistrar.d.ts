/**
 * Schema 注册器
 *
 * 管理实体 Schema 和字段组的注册与检索
 * 继承自 RegistrarBase，保持架构一致性
 */
import { RegistrarBase } from '@orbitjs/registry';
import type { RegistrSchema, FieldDefinition } from './types';
/**
 * Schema 注册器存储结构
 */
interface SchemaStorage {
    /**
     * Schema 存储
     */
    schemas: Map<string, RegistrSchema>;
    /**
     * 字段组存储
     */
    fields: Map<string, FieldDefinition[]>;
}
/**
 * Schema 注册器名称常量
 */
export declare const SchemaRegistrarName = "schema";
/**
 * SchemaRegistrar 类用于管理模式和字段定义的注册与检索
 *
 * 设计特点：
 * - 支持两种不同的注册模式：实体模式和字段组模式
 * - 使用两个独立的存储来分别管理实体模式和字段定义
 * - 提供统一的API来访问不同类型的数据
 *
 * @example
 * ```typescript
 * const registrar = SchemaRegistrar.getInstance();
 *
 * // 注册 Schema
 * registrar.register({
 *     name: 'User',
 *     fields: [
 *         { name: 'id', type: 'string', required: true },
 *         { name: 'name', type: 'string', minLength: 2 }
 *     ]
 * });
 *
 * // 注册字段组
 * registrar.register('addressFields', [
 *     { name: 'street', type: 'string' },
 *     { name: 'city', type: 'string' }
 * ]);
 *
 * // 获取 Schema
 * const schema = registrar.get('User');
 *
 * // 获取字段组
 * const fields = registrar.getField('addressFields');
 * ```
 */
export declare class SchemaRegistrar extends RegistrarBase<SchemaStorage> {
    /**
     * 注册器名称
     */
    readonly name = "schema";
    /**
     * 存储结构
     */
    protected storage: SchemaStorage;
    /**
     * 注册 Schema 或字段组
     *
     * 支持两种注册模式：
     * 1. 注册实体 Schema：register(schema)
     * 2. 注册字段组：register(name, fields)
     *
     * @param arg1 - Schema 对象或字段组名称
     * @param arg2 - 字段定义数组（可选）
     */
    register(arg1: RegistrSchema | string, arg2?: FieldDefinition[]): void;
    /**
     * 注销 Schema 或字段组
     *
     * @param name - Schema 名称或字段组名称
     */
    unregister(name: string): void;
    /**
     * 获取 Schema 或字段组
     *
     * @param name - 名称
     * @param type - 类型（'schema' 或 'field'）
     * @returns Schema 或字段组
     */
    get<T = RegistrSchema>(name: string, type?: 'schema' | 'field'): T;
    /**
     * 获取字段组的快捷方法
     *
     * @param groupName - 字段组名称
     * @returns 字段定义数组
     */
    getField(groupName: string): FieldDefinition[];
    /**
     * 检查 Schema 或字段组是否存在
     *
     * @param name - 名称
     * @param type - 类型（'schema' 或 'field'）
     * @returns 是否存在
     */
    has(name: string, type?: 'schema' | 'field'): boolean;
    /**
     * 获取所有 Schema 名称
     *
     * @returns Schema 名称列表
     */
    getAllSchemaNames(): string[];
    /**
     * 获取所有字段组名称
     *
     * @returns 字段组名称列表
     */
    getAllFieldNames(): string[];
    /**
     * 清空所有注册项
     */
    clear(): void;
    /**
     * 输出注册器状态信息
     */
    protected doInspect(): void;
}
export {};
//# sourceMappingURL=SchemaRegistrar.d.ts.map