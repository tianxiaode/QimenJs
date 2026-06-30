/**
 * 预定义字段常量
 *
 * 提供常用字段的快捷引用，减少 Schema 定义时的重复代码。
 * 使用方式：在 fields 数组中直接引用 F.id, F.createdAt 等。
 *
 * @example
 * ```typescript
 * import { F } from '@/schema';
 *
 * const UserSchema: RegistrSchema = {
 *     name: 'User',
 *     fields: [F.id, F.name, F.createdAt, F.updatedAt, { name: 'email', type: 'string' }],
 * };
 * ```
 */

import type { FieldDefinition } from './types';

/**
 * 预定义字段常量
 *
 * 每个字段都是完整的 FieldDefinition，可以直接在 Schema 的 fields 数组中引用。
 * 也可以通过展开运算符进行定制：`{ ...F.id, label: '编号' }`
 */
export const F: Record<string, FieldDefinition> = {
    // 基础标识字段
    id: { name: 'id', type: 'string' },
    name: { name: 'name', type: 'string' },
    code: { name: 'code', type: 'string' },
    label: { name: 'label', type: 'string' },
    description: { name: 'description', type: 'string' },

    // 审计字段
    createdAt: { name: 'createdAt', type: 'date', readonly: true },
    updatedAt: { name: 'updatedAt', type: 'date', readonly: true },
    deletedAt: { name: 'deletedAt', type: 'date' },

    // 状态字段
    status: { name: 'status', type: 'string' },
    sort: { name: 'sort', type: 'number' },
    enabled: { name: 'enabled', type: 'boolean' },

    // 树形字段
    parentId: { name: 'parentId', type: 'string' },
    children: { name: 'children', type: 'array' },
    path: { name: 'path', type: 'string' },
    leaf: { name: 'leaf', type: 'boolean' },
    expanded: { name: 'expanded', type: 'boolean' },
};
