import type { AbilityDefinition } from '@/composable';

/**
 * FlatRemoteStateAbility - 扁平远程状态能力
 *
 * 提供对实体集合的计算属性和状态管理方法。
 * 数据字段（loading, items, page 等）已在 Manager 上定义，
 * 此 Ability 补充计算属性和状态操作方法。
 * 
 * 注意：不定义与 Manager 数据字段同名的 getter（如 loading, items, page 等），
 * 避免覆盖实例属性导致无法赋值。
 * 
 * this 指向宿主（Manager），数据字段直接在 this 上访问。
 */
export const FlatRemoteStateAbility: AbilityDefinition = {
    // 计算属性（不与 Manager 数据字段同名）
    isEmpty: { get() { return this.items.length === 0; } },

    // 状态操作方法（原 FlatRemoteEntityState 的方法）

    /**
     * 更新列表数据和分页信息
     */
    updateData(list: any[], total?: number): void {
        this.items = list || [];
        this.total = typeof total === 'number' ? total : this.items.length;
        this.pages = Math.ceil(this.total / this.pageSize) || 0;
        this.hasMore = this.page < this.pages;
    },

    /**
     * 更新单个实体
     */
    updateItem(item: any): void {
        if (!item) return;
        this.item = item;
        // 同步到 items 列表
        const index = this.items.findIndex((i: any) => i.id === item.id);
        if (index >= 0) {
            this.items[index] = item;
        }
    },

    /**
     * 验证页码是否有效
     */
    isValidPage(page: number): boolean {
        return page >= 1 && page <= this.pages;
    },

    /**
     * 从 items 中删除实体
     */
    deleteFromItems(id: string | number | (string | number)[]): void {
        const ids = Array.isArray(id) ? id : [id];
        this.items = this.items.filter((i: any) => !ids.includes(i.id));
        this.total = Math.max(0, this.total - ids.length);
        this.pages = Math.ceil(this.total / this.pageSize) || 0;
        this.hasMore = this.page < this.pages;
    },

    /**
     * 刷新视图（替换数组引用以触发响应式更新）
     */
    refreshView(): void {
        this.items = [...this.items];
    },

    /**
     * 开始编辑
     */
    edit(item: any): void {
        this.startEdit(item);
    },

    /**
     * 回滚所有编辑
     */
    rollback(): void {
        this.rollbackAll();
    },
};
