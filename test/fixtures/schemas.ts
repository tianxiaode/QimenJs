/**
 * 测试 Schema 定义
 *
 * 提供统一的测试 Schema 注册和预定义 Schema，避免每个测试文件重复编写。
 */
import { SchemaRegistrar } from '@/schema';
import type { RegistrSchema, FieldDefinition } from '@/schema/types';

/**
 * 注册测试 Schema，返回清理函数
 */
export function registerTestSchema(schema: RegistrSchema): () => void {
    const registrar = SchemaRegistrar.getInstance();
    registrar.register(schema);

    return () => {
        registrar.unregister(schema.name);
    };
}

/**
 * 测试用户 Schema - 含 name → displayName 映射
 */
export const TestUserSchema: RegistrSchema = {
    name: 'TestUser',
    domain: 'test-api',
    idField: 'id',
    nameField: 'name',
    isTree: false,
    searchFields: ['name'],
    fields: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string', mapping: 'displayName' },
        { name: 'email', type: 'string' },
        { name: 'age', type: 'number' },
    ],
};

/**
 * 测试产品 Schema - 含 price → unitPrice 映射
 */
export const TestProductSchema: RegistrSchema = {
    name: 'TestProduct',
    domain: 'test-api',
    idField: 'id',
    nameField: 'productName',
    isTree: false,
    searchFields: ['productName'],
    fields: [
        { name: 'id', type: 'string' },
        { name: 'productName', type: 'string' },
        { name: 'price', type: 'number', mapping: 'unitPrice' },
        { name: 'category', type: 'string' },
    ],
};

/**
 * 测试订单 Schema
 */
export const TestOrderSchema: RegistrSchema = {
    name: 'TestOrder',
    domain: 'test-api',
    idField: 'id',
    nameField: 'orderNo',
    isTree: false,
    searchFields: ['orderNo'],
    fields: [
        { name: 'id', type: 'string' },
        { name: 'orderNo', type: 'string' },
        { name: 'amount', type: 'number' },
        { name: 'status', type: 'string' },
    ],
};
