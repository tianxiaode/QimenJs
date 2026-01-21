import { IEntity, ITreeLocalEntityState, ITreeSearchParams, TreeSchema } from '../../types';
import { LocalEntityState } from './LocalEntityState';
import { array } from '@orbitjs/utils';

export class TreeLocalEntityState<T extends IEntity, TSearch extends ITreeSearchParams>
    extends LocalEntityState<T, TSearch>
    implements ITreeLocalEntityState<T, TSearch>
{

    async updateData(data: T[]): Promise<void> {
        this.sourceData = data;
        await this.setCache(data);
    }

    get items(): T[] {
        const { idField, parentIdField, childrenField } = this.schema as TreeSchema;
        // 1. 合并补丁和新增
        const fullList = [
            ...this.sourceData.map(item => {
                const patch = this.changes.updated.get((item as any)[idField!]);
                return patch ? { ...item, ...patch } : item;
            }),
            ...this.changes.added,
        ];

        // 2. 树形过滤（保持父级可见）
        const filtered = this.applyTreeSearch(fullList);

        // 3. 实时转树
        // 既然节点不多，ArrayToTree 的开销在毫秒级，完全可以接受
        return array.toTree(filtered, {
            idField: idField,
            parentField: parentIdField,
            childrenField: childrenField!,
            orderBy: this.search.orderBy,
            removeEmptyChildren: true,
        });
    }

    move(id: string | number, newParentId: string | number | null): void {
        const idField = this.schema.idField!;
        const parentField = (this.schema as any).parentField || 'parentId';

        // 1. 找到镜像中的目标节点
        const item = this.sourceData.find(i => (i as any)[idField] === id);

        if (item) {
            // 2. 直接修改镜像源里的 parentId
            // 注意：因为 items Getter 是响应式的，改了镜像后树会自动重构
            (item as any)[parentField] = newParentId;

            // 3. 如果有缓存，同步缓存
            this.setCache(this.sourceData);
        }
    }

    delete(ids: (string | number)[]): void {
        const idField = this.schema.idField!;
        const parentField = (this.schema as any).parentField || 'parentId';

        // 1. 获取所有要删除的 ID（包含传入的 ID 及其所有子孙）
        const allToDelete = new Set<string | number>();

        const collectIds = (targetIds: (string | number)[]) => {
            targetIds.forEach(id => {
                if (allToDelete.has(id)) return;
                allToDelete.add(id);
                // 找到以当前 ID 为父节点的所有子节点
                const children = this.sourceData
                    .filter(item => (item as any)[parentField] === id)
                    .map(item => (item as any)[idField]);
                if (children.length > 0) collectIds(children);
            });
        };

        collectIds(ids);

        // 2. 从镜像源抹除
        this.sourceData = this.sourceData.filter(item => !allToDelete.has((item as any)[idField]));

        // 3. 同步缓存
        this.setCache(this.sourceData);
    }

    protected applyTreeSearch(data: T[]): T[] {
        if (!this.search.keyword) return data;

        const idField = this.schema.idField!;
        const parentField = (this.schema as any).parentField || 'parentId';
        const keyword = this.search.keyword.toLowerCase();

        const matchedIds = new Set<string | number>();
        const dataMap = new Map(data.map(item => [(item as any)[idField], item]));

        // 1. 标记所有直接匹配的项及其祖先
        data.forEach(item => {
            if (this.matchKeyword(item, keyword)) {
                let curr: any = item;
                while (curr) {
                    const cid = curr[idField];
                    if (matchedIds.has(cid)) break;
                    matchedIds.add(cid);
                    curr = dataMap.get(curr[parentField]); // 追溯父级
                }
            }
        });

        // 2. 仅保留在匹配链路上的节点
        return data.filter(item => matchedIds.has((item as any)[idField]));
    }


}
