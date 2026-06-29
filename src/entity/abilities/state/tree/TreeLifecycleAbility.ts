import { AbilityBase, type IExposeResult, type AbilityProxy } from '@/composable';
import type { IEntity } from '@/schema';

export class TreeLifecycleAbility extends AbilityBase {
    protected expose(proxy: AbilityProxy): IExposeResult {
        return {
            removeNode: (id: string | number) => proxy.self.removeNode(id),
            moveNode: (id: string | number, targetPid: string | number | null) =>
                proxy.self.moveNode(id, targetPid),
            syncChildren: (pid: string | number | null, newData: IEntity[]) =>
                proxy.self.syncChildren(pid, newData),
            getChildren: (pid?: any, predicate?: any) => proxy.self.getChildren(pid, predicate),
        };
    }

    protected removeNode(id: string | number): void {
        const host = this.host as any;
        const targetNode = host.nodes.get(id) as any;
        if (!targetNode) return;

        const pathPrefix = targetNode._path; // 例如 "1.2"
        const pid = targetNode[host.parentIdField];

        // 1. 从父级的索引中移除自己 (只影响直接父级)
        const siblings = host.hierarchy.get(pid);
        if (siblings) {
            host.hierarchy.set(
                pid,
                siblings.filter((childId: any) => childId !== id)
            );
        }

        // 2. 批量删除自己和所有子孙 (线性扫描)
        // 凡是路径为 "1.2" 或以 "1.2." 开头的节点全部删除
        host.nodes.forEach((node: any, nodeId: any) => {
            if (nodeId === id || node._path.startsWith(`${pathPrefix}.`)) {
                host.nodes.delete(nodeId);
                host.hierarchy.delete(nodeId); // 同时清理这些节点的子索引
            }
        });
    }

    moveNode(id: string | number, targetPid: string | number | null): void {
        const host: any = this.host;
        const node = host.nodes.get(id) as any;

        if (!node) return;

        const oldPid = node[host.parentIdField];
        if (oldPid === targetPid) return;

        // 1. 获取旧路径和新父节点的路径
        const oldPathPrefix = node._path; // 例如 "1.2"
        const targetParent = host.nodes.get(targetPid as any) as any;
        const newParentPath = targetParent?._path || '';
        const newPathPrefix = newParentPath ? `${newParentPath}.${id}` : `${id}`;

        const oldDepth = node._depth || 0;
        const newDepth = newParentPath ? targetParent._depth + 1 : 0;
        const depthDelta = newDepth - oldDepth;
        // 2. 修正 hierarchy 索引 (维护兄弟关系)
        // 从旧父级移除
        const oldSiblings = host.hierarchy.get(oldPid);
        if (oldSiblings) {
            host.hierarchy.set(
                oldPid,
                oldSiblings.filter((sid: any) => sid !== id)
            );
        }
        // 加入新父级
        const newSiblings = host.hierarchy.get(targetPid) || [];
        if (!newSiblings.includes(id)) {
            newSiblings.push(id);
            host.hierarchy.set(targetPid, newSiblings);
        }

        // 3. 批量更新自己及所有子孙节点的路径和深度 (关键：利用 path 进行前缀替换)
        host.nodes.forEach((item: any) => {
            // 如果是该节点本身，或者是该节点的子孙
            if (item.id === id || item._path.startsWith(`${oldPathPrefix}.`)) {
                // 字符串替换：把旧前缀换成新前缀
                // 例如把 "1.2.3" 换成 "4.5.2.3"
                item._path = item._path.replace(oldPathPrefix, newPathPrefix);

                // 重新计算深度
                item._depth = (item._depth || 0) + depthDelta;

                // 如果是移动节点本人，还要更新 parentId
                if (item.id === id) {
                    item.parentId = targetPid;
                }
            }
        });

        // 4. (可选) 如果移动到了一个未展开的节点下，可能需要自动展开目标父节点
        if (targetParent) {
            host.toggleExpand(targetParent, true);
            host.toggleLeaf(targetParent, false);
        }
    }

    protected syncChildren(pid: string | number | null, newData: IEntity[]): void {
        const host = this.host as any;
        const newIds = newData.map((item: any) => item[host.idField]);
        const oldIds = host.hierarchy.get(pid) || [];

        // 1. 找出差集：在旧索引里有，但在新数据里没了的 ID
        const toRemoveIds = oldIds.filter((id: any) => !newIds.includes(id));

        // 2. 执行彻底清理（级联删除子孙）
        toRemoveIds.forEach((id: any) => {
            this.removeNode(id); // 利用现有的 removeNode 方法，它已经支持路径前缀批量删除
        });
    }

    protected getChildren(
        pid: string | number | null = this.host.root,
        predicate?: (node: IEntity) => boolean
    ): IEntity[] {
        const host = this.host as any;
        // 从索引中获取 ID 列表
        const childIds = host.hierarchy.get(pid) || [];

        // 转换为实体对象列表，并过滤掉可能不存在的引用
        let children = childIds.map((id: any) => host.nodes.get(id)!).filter(Boolean);

        // 如果传入了自定义处理/过滤逻辑
        if (predicate) {
            children = children.filter(predicate);
        }

        return children;
    }
}
