import { OrderCondition, orderBy } from './sort';

export interface TreeOptions<T> {
    idField?: keyof T;
    parentField?: keyof T;
    childrenField?: string;
    /** 分层排序条件 */
    orderBy?: OrderCondition<T>[];
}

/**
 * 扁平转树形 (带分层排序)
 */
export function toTree<T>(data: T[], options: TreeOptions<T> = {}): T[] {
    const {
        idField = 'id' as keyof T,
        parentField = 'parentId' as keyof T,
        childrenField = 'children',
        orderBy: sortConditions,
    } = options;

    // 1. 建立节点映射 (先克隆数据，防止污染原对象)
    const nodeMap = new Map<any, any>();
    const roots: any[] = [];

    // 2. 预处理：创建带 children 的浅拷贝对象
    data.forEach(item => {
        nodeMap.set(item[idField], { ...item, [childrenField]: [] });
    });

    // 3. 组织父子关系
    nodeMap.forEach(node => {
        const parentId = node[parentField];
        if (parentId != null && nodeMap.has(parentId)) {
            nodeMap.get(parentId)[childrenField].push(node);
        } else {
            roots.push(node);
        }
    });

    // 4. 如果有排序需求，执行递归分层排序
    if (sortConditions && sortConditions.length > 0) {
        const sortRecursive = (list: any[]) => {
            // 对当前层级排序
            const sorted = orderBy(list, sortConditions);
            // 替换原列表内容 (in-place 修改以保持引用)
            list.length = 0;
            list.push(...sorted);
            // 递归子级
            list.forEach(node => {
                if (node[childrenField]?.length > 0) {
                    sortRecursive(node[childrenField]);
                }
            });
        };
        sortRecursive(roots);
    }

    return roots;
}
