/**
 * 树形域 Schema 定义
 *
 * 演示 RemoteTreeEntityManager 的树形数据管理
 * 对应后端接口：GET /api/departments
 */
import type { RegistrSchema } from '@qimen-lab/core/schema';

/**
 * 部门 Schema（树形）
 *
 * 用于 RemoteTreeEntityManager 演示
 * 能力：list / get / expand / collapse / move / refresh / create / update / delete
 * 响应格式：{ items: Department[], totalCount: number }
 */
export const DepartmentSchema: RegistrSchema = {
    name: 'Department',
    domain: 'abp',
    idField: 'id',
    idType: 'number',
    isTree: true,
    isLazy: true,
    root: null,
    parentIdField: 'parentId',
    childrenField: 'children',
    leafField: 'leaf',
    expandedField: 'expanded',
    useFlat: true,
    searchFields: ['name'],
    fields: [
        { name: 'id', type: 'number', readonly: true },
        { name: 'name', type: 'string', searchable: true, label: '部门名称' },
        { name: 'parentId', type: 'number', label: '上级部门' },
        { name: 'leaf', type: 'boolean', label: '是否叶节点' },
        { name: 'expanded', type: 'boolean', label: '是否展开' },
        { name: 'employeeCount', type: 'number', label: '人数' },
    ],
};
