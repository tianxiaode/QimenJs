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
export const SchemaRegistrarName = 'schema';

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
export class SchemaRegistrar extends RegistrarBase<SchemaStorage> {
    /**
     * 注册器名称
     */
    public readonly name = SchemaRegistrarName;
    
    /**
     * 存储结构
     */
    protected storage: SchemaStorage = {
        schemas: new Map(),
        fields: new Map(),
    };
    
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
    register(arg1: RegistrSchema | string, arg2?: FieldDefinition[]): void {
        this.checkLock();
        
        if (typeof arg1 === 'string' && arg2) {
            // 注册字段组
            this.storage.fields.set(arg1, arg2);
        } else {
            // 注册实体 Schema
            const schema = arg1 as RegistrSchema;
            this.storage.schemas.set(schema.name, schema);
        }
    }
    
    /**
     * 注销 Schema 或字段组
     * 
     * @param name - Schema 名称或字段组名称
     */
    unregister(name: string): void {
        this.checkLock();
        this.storage.schemas.delete(name);
        this.storage.fields.delete(name);
    }
    
    /**
     * 获取 Schema 或字段组
     * 
     * @param name - 名称
     * @param type - 类型（'schema' 或 'field'）
     * @returns Schema 或字段组
     */
    get<T = RegistrSchema>(name: string, type: 'schema' | 'field' = 'schema'): T {
        if (type === 'field') {
            const fieldDef = this.storage.fields.get(name);
            if (!fieldDef) {
                throw new Error(`[SchemaRegistrar] Field group "${name}" not found`);
            }
            return fieldDef as any;
        }
        
        const schema = this.storage.schemas.get(name);
        if (!schema) {
            throw new Error(`[SchemaRegistrar] Schema "${name}" not found`);
        }
        return schema as any;
    }
    
    /**
     * 获取字段组的快捷方法
     * 
     * @param groupName - 字段组名称
     * @returns 字段定义数组
     */
    getField(groupName: string): FieldDefinition[] {
        return this.get(groupName, 'field');
    }
    
    /**
     * 检查 Schema 或字段组是否存在
     * 
     * @param name - 名称
     * @param type - 类型（'schema' 或 'field'）
     * @returns 是否存在
     */
    has(name: string, type: 'schema' | 'field' = 'schema'): boolean {
        if (type === 'field') {
            return this.storage.fields.has(name);
        }
        return this.storage.schemas.has(name);
    }
    
    /**
     * 获取所有 Schema 名称
     * 
     * @returns Schema 名称列表
     */
    getAllSchemaNames(): string[] {
        return Array.from(this.storage.schemas.keys());
    }
    
    /**
     * 获取所有字段组名称
     * 
     * @returns 字段组名称列表
     */
    getAllFieldNames(): string[] {
        return Array.from(this.storage.fields.keys());
    }
    
    /**
     * 清空所有注册项
     */
    clear(): void {
        this.checkLock();
        this.storage.schemas.clear();
        this.storage.fields.clear();
    }
    
    /**
     * 输出注册器状态信息
     */
    protected doInspect(): void {
        console.log('📊 Schemas:', this.storage.schemas.size);
        console.log('📋 Field Groups:', this.storage.fields.size);
        
        if (this.storage.schemas.size > 0) {
            console.log('\n📦 Schemas:');
            this.storage.schemas.forEach((schema, name) => {
                console.log(`  - ${name} (${schema.fields?.length || 0} fields)`);
            });
        }
        
        if (this.storage.fields.size > 0) {
            console.log('\n📋 Field Groups:');
            this.storage.fields.forEach((fields, name) => {
                console.log(`  - ${name} (${fields.length} fields)`);
            });
        }
    }
}
