import type { AbilityDefinition } from '@/composable';

/**
 * TreeRemoteStateAbility - 树形远程状态能力
 *
 * 提供对实体集合的计算属性和状态管理方法。
 * 数据字段已在 Manager 上定义，此 Ability 补充计算属性和状态操作方法。
 *
 * 注意：不定义与 Manager 数据字段同名的 getter，避免覆盖实例属性。
 *
 * this 指向宿主（Manager），数据字段直接在 this 上访问。
 */
export const TreeRemoteStateAbility= {
    // 计算属性（不与 Manager 数据字段同名）
    isEmpty: {
        get() {
            return this.items.length === 0;
        },
    },

    // 状态操作方法（原 TreeRemoteEntityState 的方法）

    /**
     * 更新数据
     */
    updateData(list: any[], total?: number): void {
        this.items = list || [];
        this.total = typeof total === 'number' ? total : this.items.length;
    },

    /**
     * 刷新视图（默认实现，运行时会被 TreeViewAbility 覆盖）
     */
    refreshView(): void {
        this.items = [...this.items];
    },
} satisfies AbilityDefinition;
