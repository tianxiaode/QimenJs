/**
 * TreeDataAbility — 树形数据处理工具
 *
 * 提供树形结构与平面结构的相互转换、路径索引构建等纯数据操作。
 * 不依赖组件实例，可被 entity、tree-nav、tree-grid 等复用。
 *
 * 核心概念：
 * - 树形结构：节点通过 children 嵌套
 * - 平面结构：节点通过 parentId 关联，附带 depth/path 等计算字段
 */

export interface FlattenOptions {
    idField?: string;
    parentIdField?: string;
    childrenField?: string;
    pathField?: string;
    rootId?: string | number | null;
}

export interface FlatNode {
    [key: string]: any;
    depth: number;
    parentId: string | number | null;
    path: string;
}

export interface BuildTreeOptions {
    idField?: string;
    parentIdField?: string;
    childrenField?: string;
    rootId?: string | number | null;
}

export interface PathIndexOptions {
    pathField?: string;
}

export const TreeDataAbility = {
    /**
     * 树形结构 → 平面结构
     *
     * 为每个节点添加 depth（层级深度）、parentId（父节点 ID）、path（从根到当前节点的路径）
     *
     * @example
     * ```ts
     * const flat = TreeDataAbility.flatten(treeData, { idField: 'id', pathField: 'href' });
     * // flat[0] = { id: 1, depth: 0, parentId: null, path: '/home', ... }
     * ```
     */
    flatten(tree: any[], options: FlattenOptions = {}): FlatNode[] {
        const {
            idField = 'id',
            parentIdField = 'parentId',
            childrenField = 'children',
            pathField = 'path',
            rootId = null,
        } = options;

        const result: FlatNode[] = [];

        const walk = (nodes: any[], depth: number, parentId: string | number | null, parentPath: string) => {
            for (const node of nodes) {
                const id = node[idField];
                const nodePath = node[pathField] ?? '';
                const fullPath = parentPath ? `${parentPath}/${nodePath}` : nodePath;

                result.push({
                    ...node,
                    depth,
                    parentId,
                    path: fullPath,
                });

                const children = node[childrenField];
                if (children?.length) {
                    walk(children, depth + 1, id, fullPath);
                }
            }
        };

        walk(tree, 0, rootId, '');
        return result;
    },

    /**
     * 平面结构 → 树形结构
     *
     * 根据 parentId 关联重建 children 嵌套结构
     *
     * @example
     * ```ts
     * const tree = TreeDataAbility.buildTree(flatData, { idField: 'id' });
     * ```
     */
    buildTree(flat: any[], options: BuildTreeOptions = {}): any[] {
        const {
            idField = 'id',
            parentIdField = 'parentId',
            childrenField = 'children',
            rootId = null,
        } = options;

        const nodeMap = new Map<string | number, any>();
        const roots: any[] = [];

        for (const item of flat) {
            const id = item[idField];
            nodeMap.set(id, { ...item, [childrenField]: [] });
        }

        for (const item of flat) {
            const id = item[idField];
            const parentId = item[parentIdField];
            const node = nodeMap.get(id);

            if (parentId === rootId || parentId === null || parentId === undefined) {
                roots.push(node);
            } else {
                const parent = nodeMap.get(parentId);
                if (parent) {
                    parent[childrenField].push(node);
                } else {
                    roots.push(node);
                }
            }
        }

        return roots;
    },

    /**
     * 构建路径索引：path → 节点引用
     *
     * 用于路由匹配（根据当前 URL hash 快速定位对应节点）
     *
     * @example
     * ```ts
     * const index = TreeDataAbility.buildPathIndex(treeData, { pathField: 'href' });
     * // index['/home'] = { id: 1, href: '/home', ... }
     * ```
     */
    buildPathIndex(tree: any[], options: PathIndexOptions = {}): Record<string, any> {
        const { pathField = 'path' } = options;
        const index: Record<string, any> = {};

        const walk = (nodes: any[]) => {
            for (const node of nodes) {
                const path = node[pathField];
                if (path) index[path] = node;
                const children = node.children;
                if (children?.length) walk(children);
            }
        };

        walk(tree);
        return index;
    },
} as const;
