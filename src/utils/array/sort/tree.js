"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toTree = toTree;
const sort_1 = require("./sort");
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
function toTree(data, options = {}) {
    const { idField = 'id', parentField = 'parentId', childrenField = 'children', orderBy: sortConditions, removeEmptyChildren = false } = options;
    const nodeMap = new Map();
    const roots = [];
    // 1. 建立节点映射
    data.forEach(item => {
        // 每个节点预设一个空的 children 数组
        nodeMap.set(item[idField], { ...item, [childrenField]: [] });
    });
    // 2. 组织父子关系
    nodeMap.forEach(node => {
        const parentId = node[parentField];
        if (parentId != null && nodeMap.has(parentId)) {
            nodeMap.get(parentId)[childrenField].push(node);
        }
        else {
            roots.push(node);
        }
    });
    // 3. 递归处理：排序 + 清理空 children
    const processRecursive = (list) => {
        // A. 如果有排序需求，先排序当前层级
        if (sortConditions && sortConditions.length > 0) {
            const sorted = (0, sort_1.orderBy)(list, sortConditions);
            list.length = 0;
            list.push(...sorted);
        }
        // B. 遍历处理子节点
        for (let i = list.length - 1; i >= 0; i--) {
            const node = list[i];
            const children = node[childrenField];
            if (children && children.length > 0) {
                processRecursive(children);
            }
            else if (removeEmptyChildren) {
                // 如果没有子节点且开启了清理开关，则删除该属性
                delete node[childrenField];
            }
        }
    };
    processRecursive(roots);
    return roots;
}
//# sourceMappingURL=tree.js.map