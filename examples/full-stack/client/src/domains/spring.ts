/**
 * Spring 域 Schema 定义
 *
 * 定义 Spring 后端（Page<T> 格式）的实体 Schema
 */
import type { RegistrSchema } from '@orbitjs/schema';

/**
 * Spring 订单 Schema
 *
 * 对应后端接口：GET /api/orders
 * 响应格式：{ content: Order[], totalElements: number, number: number, totalPages: number }
 */
export const OrderSchema: RegistrSchema = {
    name: 'SpringOrder',
    domain: 'spring',
    idField: 'id',
    idType: 'number',
    isTree: false,
    searchFields: ['orderNo', 'customer'],
    defaultSort: 'id',
    defaultOrder: 'desc',
    fields: [
        { name: 'id', type: 'number', readonly: true },
        { name: 'orderNo', type: 'string', searchable: true, label: '订单号' },
        { name: 'customer', type: 'string', searchable: true, label: '客户' },
        { name: 'amount', type: 'number', label: '金额' },
        { name: 'status', type: 'string', label: '状态' },
        { name: 'createdAt', type: 'date', readonly: true, label: '创建时间' },
    ],
};

/**
 * Spring 商品 Schema
 *
 * 对应后端接口：GET /api/items
 * 响应格式：{ content: Item[], totalElements: number, number: number, totalPages: number }
 */
export const ItemSchema: RegistrSchema = {
    name: 'SpringItem',
    domain: 'spring',
    idField: 'id',
    idType: 'number',
    isTree: false,
    searchFields: ['name', 'category'],
    defaultSort: 'id',
    defaultOrder: 'desc',
    fields: [
        { name: 'id', type: 'number', readonly: true },
        { name: 'name', type: 'string', searchable: true, label: '名称' },
        { name: 'price', type: 'number', label: '价格' },
        { name: 'stock', type: 'number', label: '库存' },
        { name: 'category', type: 'string', searchable: true, label: '分类' },
    ],
};
