/**
 * 本地域 Schema 定义
 *
 * 纯前端数据管理，不需要后端 API
 * 演示 LocalReadonlyEntityManager 和 LocalCrudEntityManager
 */
import type { RegistrSchema } from '@qimen-lab/core/schema';

/**
 * 本地通知 Schema（只读）
 *
 * 用于 LocalReadonlyEntityManager 演示
 * 能力：list / get（无 create/update/delete）
 */
export const NotificationSchema: RegistrSchema = {
    name: 'LocalNotification',
    domain: 'local',
    idField: 'id',
    idType: 'number',
    isTree: false,
    searchFields: ['title'],
    fields: [
        { name: 'id', type: 'number', readonly: true },
        { name: 'title', type: 'string', searchable: true, label: '标题' },
        { name: 'message', type: 'string', label: '内容' },
        { name: 'type', type: 'string', label: '类型' },
        { name: 'read', type: 'boolean', label: '已读' },
        { name: 'createdAt', type: 'date', readonly: true, label: '时间' },
    ],
};

/**
 * 本地标签 Schema（CRUD）
 *
 * 用于 LocalCrudEntityManager 演示
 * 能力：list / get / create / update / delete
 */
export const TagSchema: RegistrSchema = {
    name: 'LocalTag',
    domain: 'local',
    idField: 'id',
    idType: 'number',
    isTree: false,
    searchFields: ['name', 'color'],
    fields: [
        { name: 'id', type: 'number', readonly: true },
        { name: 'name', type: 'string', searchable: true, label: '名称' },
        { name: 'color', type: 'string', label: '颜色' },
        { name: 'count', type: 'number', label: '使用次数' },
    ],
};
