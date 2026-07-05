import type { AbilityDefinition } from '@/composable';
import type { IEntity } from '@/schema';

/**
 * TreePathAbility - 树路径能力
 *
 * 为宿主提供树形结构的路径管理功能（ingest/rebuild/toggle）。
 * this 指向宿主（TreeRemoteEntityState），this.nodes/hierarchy/parentIdField/root 可直接访问。
 */
export const TreePathAbility: AbilityDefinition = {
    ingest(data: IEntity | IEntity[], manualParentId?: string | number | null) {
        const list = Array.isArray(data) ? data : [data];
        const parentIdField = this.parentIdField;
        const root = this.root;

        const seeds = new Set<any>();

        // 1. 第一遍：入库、建立索引、初步识别种子
        list.forEach((node: any) => {
            const id = node.id;
            const pid = node[parentIdField] ?? manualParentId ?? root;

            const existingNode = this.nodes.get(id) as any;
            if (existingNode) {
                node = { ...existingNode, ...node };
            }

            node[parentIdField] = pid;
            this.nodes.set(id, node);

            const siblings = this.hierarchy.get(pid) || [];
            if (!siblings.includes(id)) {
                siblings.push(id);
                this.hierarchy.set(pid, siblings);
            }

            if (pid === root || pid === manualParentId) {
                seeds.add(node);
            }
        });

        // 2. 第二遍：定向扩散
        if (manualParentId && this.nodes.has(manualParentId)) {
            const pNode = this.nodes.get(manualParentId) as any;
            this.toggleLeaf(pNode, false);
            this.rebuildDescendantsPaths(
                manualParentId,
                pNode._path || '',
                (pNode._depth ?? -1) + 1
            );
        } else if (seeds.size > 0) {
            seeds.forEach(seed => {
                const pNode = this.nodes.get(seed[parentIdField]) as any;
                const pPath = pNode?._path || '';
                const currentDepth = pNode ? pNode._depth + 1 : 0;

                seed._path = pPath ? `${pPath}.${seed.id}` : `${seed.id}`;
                seed._depth = currentDepth;

                this.rebuildDescendantsPaths(seed.id, seed._path, currentDepth + 1);
            });
        }
    },

    rebuildDescendantsPaths(pid: any, parentPath: string, nextDepth: number) {
        const childIds = this.hierarchy.get(pid) || [];
        childIds.forEach((id: string | number) => {
            const node = this.nodes.get(id) as any;
            if (node) {
                node._path = parentPath ? `${parentPath}.${id}` : `${id}`;
                node._depth = nextDepth;
                this.rebuildDescendantsPaths(id, node._path, nextDepth + 1);
            }
        });
    },

    toggleExpand(id: string | number | IEntity, expanded?: boolean) {
        const node = typeof id === 'object' ? id : (this.nodes.get(id) as any);
        const expandedField = this.expandedField;

        if (node) {
            node[expandedField] = expanded ?? !node[expandedField];
        }
    },

    toggleLeaf(id: string | number | IEntity, leaf?: boolean) {
        const node = typeof id === 'object' ? id : (this.nodes.get(id) as any);
        if (node) {
            node[this.leafField] = leaf;
        }
    },
};
