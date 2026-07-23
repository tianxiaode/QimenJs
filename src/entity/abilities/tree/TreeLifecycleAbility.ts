import type { AbilityDefinition } from '@/composable';
import type { IEntity } from '@/schema';

/**
 * TreeLifecycleAbility - 树生命周期能力
 *
 * 为宿主提供树形结构的节点管理功能（删除/移动/同步/获取子节点）。
 * this 指向宿主（TreeRemoteEntityState），this.nodes/hierarchy/parentIdField/root 可直接访问。
 */
export const TreeLifecycleAbility= {
    removeNode(id: string | number) {
        const targetNode = this.nodes.get(id) as any;
        if (!targetNode) return;

        const pathPrefix = targetNode._path;
        const pid = targetNode[this.parentIdField];

        // 1. 从父级的索引中移除自己
        const siblings = this.hierarchy.get(pid);
        if (siblings) {
            this.hierarchy.set(
                pid,
                siblings.filter((childId: any) => childId !== id)
            );
        }

        // 2. 批量删除自己和所有子孙
        this.nodes.forEach((node: any, nodeId: any) => {
            if (nodeId === id || node._path.startsWith(`${pathPrefix}.`)) {
                this.nodes.delete(nodeId);
                this.hierarchy.delete(nodeId);
            }
        });
    },

    moveNode(id: string | number, targetPid: string | number | null) {
        const node = this.nodes.get(id) as any;
        if (!node) return;

        const oldPid = node[this.parentIdField];
        if (oldPid === targetPid) return;

        const oldPathPrefix = node._path;
        const targetParent = this.nodes.get(targetPid as any) as any;
        const newParentPath = targetParent?._path || '';
        const newPathPrefix = newParentPath ? `${newParentPath}.${id}` : `${id}`;

        const oldDepth = node._depth || 0;
        const newDepth = newParentPath ? targetParent._depth + 1 : 0;
        const depthDelta = newDepth - oldDepth;

        // 2. 修正 hierarchy 索引
        const oldSiblings = this.hierarchy.get(oldPid);
        if (oldSiblings) {
            this.hierarchy.set(
                oldPid,
                oldSiblings.filter((sid: any) => sid !== id)
            );
        }
        const newSiblings = this.hierarchy.get(targetPid) || [];
        if (!newSiblings.includes(id)) {
            newSiblings.push(id);
            this.hierarchy.set(targetPid, newSiblings);
        }

        // 3. 批量更新自己及所有子孙节点的路径和深度
        this.nodes.forEach((item: any) => {
            if (item.id === id || item._path.startsWith(`${oldPathPrefix}.`)) {
                item._path = item._path.replace(oldPathPrefix, newPathPrefix);
                item._depth = (item._depth || 0) + depthDelta;
                if (item.id === id) {
                    item.parentId = targetPid;
                }
            }
        });

        // 4. 自动展开目标父节点
        if (targetParent) {
            this.toggleExpand(targetParent, true);
            this.toggleLeaf(targetParent, false);
        }
    },

    syncChildren(pid: string | number | null, newData: IEntity[]) {
        const newIds = newData.map((item: any) => item[this.idField]);
        const oldIds = this.hierarchy.get(pid) || [];

        const toRemoveIds = oldIds.filter((id: any) => !newIds.includes(id));
        toRemoveIds.forEach((id: any) => {
            this.removeNode(id);
        });
    },

    getChildren(pid?: string | number | null, predicate?: (node: IEntity) => boolean): IEntity[] {
        const resolvedPid = pid ?? this.root;
        const childIds = this.hierarchy.get(resolvedPid) || [];
        let children = childIds.map((id: any) => this.nodes.get(id)!).filter(Boolean);

        if (predicate) {
            children = children.filter(predicate);
        }

        return children;
    },
} satisfies AbilityDefinition;
