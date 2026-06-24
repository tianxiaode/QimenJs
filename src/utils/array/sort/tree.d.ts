import { OrderCondition } from './sort';
export interface TreeOptions<T> {
    idField?: keyof T;
    parentField?: keyof T;
    childrenField?: string;
    /** 分层排序条件 */
    orderBy?: OrderCondition<T>[];
    /** 是否移除空子节点数组 (默认 false，即保留 []) */
    removeEmptyChildren?: boolean;
}
/**
 * 将扁平数据转换为树形结构 (支持分层排序)
 *
 * @template T - 数据项的类型
 * @param {T[]} data - 需要转换的扁平数据数组
 * @param {TreeOptions<T>} options - 转换选项
 * @param {keyof T} [options.idField='id'] - 标识唯一性的字段名
 * @param {keyof T} [options.parentField='parentId'] - 指向父级节点的字段名
 * @param {string} [options.childrenField='children'] - 存储子节点的字段名
 * @param {OrderCondition<T>[]} [options.orderBy] - 可选的排序条件，用于对每层节点进行排序
 * @param {boolean} [options.removeEmptyChildren=false] - 是否移除空子节点数组，默认为false，即保留[]
 * @returns {T[]} 转换后的树形结构数组
 *
 * @example
 * const flatData = [
 *   { id: 1, name: 'Parent', parentId: null },
 *   { id: 2, name: 'Child1', parentId: 1 },
 *   { id: 3, name: 'Child2', parentId: 1 }
 * ];
 * const tree = toTree(flatData);
 * // 返回: [{ id: 1, name: 'Parent', parentId: null, children: [...] }]
 */
export declare function toTree<T>(data: T[], options?: TreeOptions<T>): T[];
//# sourceMappingURL=tree.d.ts.map