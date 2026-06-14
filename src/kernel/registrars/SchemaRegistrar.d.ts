import { RegistrarBase } from '@/registry';
import { RegistrSchema, FieldDefinition } from '../types';
/**
 * SchemaRegistrar 名称常量
 */
export declare const SchemaRegistrarName = "schema";
/**
 * SchemaRegistrar 类用于管理模式和字段定义的注册与检索
 * 提供了灵活的注册方式，支持实体模式和字段组的注册
 *
 * 设计特点：
 * - 支持两种不同的注册模式：实体模式和字段组模式
 * - 使用两个独立的存储来分别管理实体模式和字段定义
 * - 提供统一的API来访问不同类型的数据
 */
export declare class SchemaRegistrar extends RegistrarBase<Map<string, RegistrSchema>> {
    readonly name = "schema";
    /**
     * 实体模式存储，用于存储实体模式定义
     * key: 实体名称
     * value: RegistrSchema对象
     */
    private schemaStorage;
    /**
     * 字段定义存储，用于存储字段组定义
     * key: 字段组名称
     * value: FieldDefinition数组
     */
    private fieldStorage;
    protected storage: Map<string, RegistrSchema>;
    /**
     * 注册字段组
     * @param name 字段组名称
     * @param fields 字段定义数组
     */
    register(name: string, fields: FieldDefinition[]): void;
    /**
     * 注册实体模式
     * @param entry 实体模式对象，包含名称和其他相关信息
     */
    register(entry: RegistrSchema): void;
    /**
     * 删除注册项
     * 从两个存储中都尝试删除，确保完全移除
     * @param id 要删除的注册项ID
     */
    unregister(id: string): void;
    /**
     * 获取指定名称的注册项
     * @param name 要获取的项的名称
     * @param type 获取类型（schema 或 field），默认为 schema
     * @returns 对应的注册项
     */
    get<T = RegistrSchema>(name: string, type?: 'schema' | 'field'): T;
    /**
     * 专门获取字段的快捷接口
     * @param groupName 字段组名称
     * @returns 对应的字段定义数组
     */
    getField(groupName: string): FieldDefinition[];
    /**
     * 清空所有注册项
     * 同时清空实体模式存储和字段定义存储
     */
    clear(): void;
    /**
     * 输出内部状态
     * 用于调试目的，显示当前注册的所有字段组和实体
     */
    protected doInspect(): void;
}
//# sourceMappingURL=SchemaRegistrar.d.ts.map