import { PageResult, PaginationParams } from '../types';
import { CrudEntityManager } from './CrudEntityManager';

export abstract class TreeEntityManager extends CrudEntityManager {
    // 树结构特有的配置
    protected parentKey: string = 'parentId';
    protected childrenKey: string = 'children';

    /**
     * 重写 list
     * 自动处理 parentId 逻辑，并根据配置决定是否原地转树
     */
    /**
     * 加载树数据
     * @param params 查询参数
     * @param options.fullSync 是否强制全量加载并转树 (默认为 false，即懒加载模式)
     */
    public async list(
        params: PaginationParams = {},
        fullSync: boolean = false
    ): Promise<PageResult> {
        if (params[this.parentKey] !== undefined && params.parentId === undefined) {
            params.parentId = params[this.parentKey];
        }

        // 模式 A：全量同步 (针对数据量不大或后端没做递归的情况)
        if (fullSync) {
            // 直接调用 all() 获取全量平铺数据
            const res = await this.all(params);
            const treeData = this.arrayToTree(res?.list || []);

            this._lastResult = {
                items: treeData,
                total: res?.total || 0,
                page: 1,
                pageSize: res?.total || 0,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
            };
            return this._lastResult;
        }

        // 模式 B：标准模式 (懒加载或后端已处理好)
        // 调用 CrudEntityManager 的 list，它会根据 _isLocal 自动决定去哪取
        const result = await super.list(params);

        // 如果后端给的是平铺的子节点列表，我们尝试原地转树（如果是单层，转出来还是平的）
        if (result.items && result.items.length > 0) {
            result.items = this.arrayToTree(result.items);
        }

        return result;
    }
    /**
     * 专门为树设计的"加载子节点"快捷方法
     * 依然复用 list 的逻辑和事件流
     */
    public async loadChildren(parentId: string | number) {
        return this.list({ parentId: parentId });
    }

    /**
     * [本地功能] 将平铺数组转换为树形结构
     * 如果后端只给 list，不给 tree，这个工具就派上用场了
     */
    protected arrayToTree(list: any[]): any[] {
        const map: any = {};
        const roots: any[] = [];

        list.forEach(item => {
            map[item[this.rowKey]] = { ...item, [this.childrenKey]: [] };
        });

        list.forEach(item => {
            const node = map[item[this.rowKey]];
            const parent = map[item[this.parentKey]];
            if (parent) {
                parent[this.childrenKey].push(node);
            } else {
                roots.push(node);
            }
        });

        return roots;
    }

    /**
     * [覆写本地搜索] 树形搜索通常需要保留父节点路径
     */
    protected localSearchHandler(items: any[], keyword?: string): any[] {
        if (!keyword) return items;
        // 树形搜索逻辑：如果子节点匹配，父节点也必须保留
        return this.filterTree(items, node =>
            JSON.stringify(node).toLowerCase().includes(keyword.toLowerCase())
        );
    }

    private filterTree(tree: any[], predicate: (node: any) => boolean): any[] {
        return tree.reduce((acc, node) => {
            const children = node[this.childrenKey]
                ? this.filterTree(node[this.childrenKey], predicate)
                : [];
            if (predicate(node) || children.length > 0) {
                acc.push({ ...node, [this.childrenKey]: children });
            }
            return acc;
        }, []);
    }
}