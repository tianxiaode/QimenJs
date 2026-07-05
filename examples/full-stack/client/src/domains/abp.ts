/**
 * ABP 域 Schema 定义
 *
 * 定义 ABP 后端（PagedResultDto 格式）的实体 Schema
 */
import type { RegistrSchema } from '@qimen-lab/schema';

/**
 * ABP 用户 Schema
 *
 * 对应后端接口：GET /api/app/user
 * 响应格式：{ items: User[], totalCount: number }
 */
export const UserSchema: RegistrSchema = {
    name: 'AbpUser',
    domain: 'abp',
    idField: 'id',
    idType: 'number',
    isTree: false,
    searchFields: ['userName', 'name', 'email'],
    defaultSort: 'id',
    defaultOrder: 'desc',
    fields: [
        { name: 'id', type: 'number', readonly: true },
        { name: 'userName', type: 'string', searchable: true, label: '用户名' },
        { name: 'name', type: 'string', searchable: true, label: '姓名' },
        { name: 'email', type: 'string', searchable: true, label: '邮箱' },
        { name: 'isActive', type: 'boolean', label: '状态' },
        { name: 'creationTime', type: 'date', readonly: true, label: '创建时间' },
    ],
};

/**
 * ABP 产品 Schema
 *
 * 对应后端接口：GET /api/app/product
 * 响应格式：{ items: Product[], totalCount: number }
 */
export const ProductSchema: RegistrSchema = {
    name: 'AbpProduct',
    domain: 'abp',
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
        { name: 'creationTime', type: 'date', readonly: true, label: '创建时间' },
    ],
};
