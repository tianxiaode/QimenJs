import { AbilityBase } from '../../../composable';
import { IEntity, IExposeResult, ITreeSearchParams, ITreeRemoteEntityState } from '../../../types';

export class TreePathAbility<
    T extends IEntity,
    TSearch extends ITreeSearchParams
> extends AbilityBase<ITreeRemoteEntityState<T, TSearch>> {
    /**
     * 暴露远程获取实体的方法
     *
     * @returns 包含 remoteGet 方法的对象，用于远程获取单个实体
     */
    protected expose(): IExposeResult {
        const { host } = this;

        return {
            /**
             * 远程获取实体
             *
             * @param id 要获取的实体ID
             * @returns Promise<T> 获取的实体的Promise
             */
            ingest: (data: T | T[], manualParentId?: string | number | null) =>
                this.ingest(data, manualParentId),
            rebuildDescendantsPaths: (pid: any, parentPath: string, nextDepth: number) =>
                this.rebuildDescendantsPaths(pid, parentPath, nextDepth),
            toggleExpand: (id: string | number | T, expanded?: boolean) =>
                this.toggleExpand(id, expanded),
            toggleLeaf: (id: string | number | T, leaf?: boolean) => this.toggleLeaf(id, leaf),
        };
    }

    protected ingest(data: T | T[], manualParentId?: string | number | null): void {
        const { host } = this;
        const list = Array.isArray(data) ? data : [data];
        const parentIdField = host.parentIdField;
        const root = host.root;

        // 本次变动的“顶层”节点，即路径计算的起点
        const seeds = new Set<any>();

        // 1. 第一遍：入库、建立索引、初步识别种子
        list.forEach((node: any) => {
            const id = node.id;
            const pid = node[parentIdField] ?? manualParentId ?? root;

            const existingNode = host.nodes.get(id) as any;
            if (existingNode) {
                // 合并业务数据，但保留 _path, _depth, expanded 等
                node = { ...existingNode, ...node };
            }

            node[parentIdField] = pid;
            host.nodes.set(id, node);

            // 维护父子索引
            const siblings = host.hierarchy.get(pid) || [];
            if (!siblings.includes(id)) {
                siblings.push(id);
                host.hierarchy.set(pid, siblings);
            }

            // 判定种子：如果 pid 是 root，或者是我们手动指定的父，它就是计算起点
            if (pid === root || pid === manualParentId) {
                seeds.add(node);
            }
        });

        // 2. 第二遍：定向扩散
        if (manualParentId && host.nodes.has(manualParentId)) {
            // 场景 2：直接从指定的父节点向下刷，这是最快的，因为它甚至不需要遍历 seeds
            const pNode = host.nodes.get(manualParentId) as any;
            this.toggleLeaf(pNode, false);
            this.rebuildDescendantsPaths(
                manualParentId,
                pNode._path || '',
                (pNode._depth ?? -1) + 1
            );
        } else if (seeds.size > 0) {
            // 场景 1 & 3：从识别出的种子开始向下刷
            seeds.forEach(seed => {
                // 如果种子本身就是第一层，先给它初始化路径
                const pNode = host.nodes.get(seed[parentIdField]) as any;
                const pPath = pNode?._path || '';
                const currentDepth = pNode ? pNode._depth + 1 : 0;

                // 更新种子本身的路径
                seed._path = pPath ? `${pPath}.${seed.id}` : `${seed.id}`;
                seed._depth = currentDepth;

                // 递归更新它的后代
                this.rebuildDescendantsPaths(seed.id, seed._path, currentDepth + 1);
            });
        }
    }

    protected rebuildDescendantsPaths(pid: any, parentPath: string, nextDepth: number): void {
        const { host } = this;
        const childIds = host.hierarchy.get(pid) || [];
        childIds.forEach(id => {
            const node = host.nodes.get(id) as any;
            if (node) {
                node._path = parentPath ? `${parentPath}.${id}` : `${id}`;
                node._depth = nextDepth;
                // 情况 1 & 3 可能带有多层，所以这里必须保持递归
                this.rebuildDescendantsPaths(id, node._path, nextDepth + 1);
            }
        });
    }

    protected toggleExpand(id: string | number | T, expanded?: boolean): void {
        const host = this.host;
        const node = typeof id === 'object' ? id : (host.nodes.get(id) as any);
        const expandedField = host.expandedField;

        if (node) {
            // 如果传了值就设为传的值，没传就取反
            node[expandedField] = expanded ?? !node[expandedField];
        }
    }

    protected toggleLeaf(id: string | number | T, leaf?: boolean): void {
        const host = this.host;
        const node = typeof id === 'object' ? id : (host.nodes.get(id) as any);
        if (node) {
            node[host.leafField] = leaf;
        }
    }
}
