import { IEntity, IFlatLocalEntityState, ILocalSearchParams } from '../../types';
import { LocalEntityState } from './LocalEntityState';
import { array } from '@orbitjs/utils';

export class FlatLocalEntityState<T extends IEntity, TSearch extends ILocalSearchParams>
    extends LocalEntityState<T, TSearch>
    implements IFlatLocalEntityState<T, TSearch>
{
    async updateData(data: T[]): Promise<void> {
        this.sourceData = data;
        await this.setCache(data); // 异步保存到本地，不怕丢
    }

    get items(): T[] {
        const idField = this.idField;

        // 1. 应用“修改补丁”到原始数据
        const patchedData = this.sourceData.map(item => {
            const patch = this.changes.updated.get(item[idField as keyof T]);
            return patch ? { ...item, ...patch } : item;
        });

        // 2. 加上“新增项”
        const allData = [...patchedData, ...this.changes.added];

        // 3. 执行过滤排序
        return this.applyLocalSearch(allData);
    }

    async delete(id: string | number | string[] | number[]): Promise<void> {
        const ids = Array.isArray(id) ? id : [id];
        const idSet = new Set(ids);
        const idField = this.idField;

        // 抹除内存镜像
        this.sourceData = this.sourceData.filter(item => {
            const itemId = (item as any)[idField];
            const tempId = (item as any).tempId;
            // 只有当正式 ID 和 临时 ID 都不在待删除集合中时，才保留
            return !idSet.has(itemId) && !idSet.has(tempId);
        });
        
        // 同步到 IndexDB/LocalStorage 缓存
        await this.setCache(this.sourceData);
    }

    protected applyLocalSearch(data: T[]): T[] {
        let result = data;

        // 统一处理关键词过滤（基础数据和新增数据都会在这里被检查）
        if (this.search.keyword) {
            result = result.filter(item => this.matchKeyword(item, this.search.keyword!));
        }

        // 统一排序
        if (this.search.sortBy) {
            result = array.orderBy(result, [
                {
                    by: this.search.sortBy as keyof T,
                    order: this.search.sortOrder as 'asc' | 'desc',
                },
            ]);
        }

        return result;
    }
}
