import type { AbilityDefinition } from '@/composable';

/**
 * TreeManagerAbility - 树形管理器能力
 * 
 * 提供树形结构的展开/折叠/刷新/移动等操作。
 * this 指向宿主（Manager），this.state 可直接访问。
 * 防抖通过 this.debounce() 管理，宿主统一管理。
 */
export const TreeManagerAbility: AbilityDefinition = {
    // 基础操作
    expand(id: string | number) {
        return this.debounce('expand', (i: string | number) => this._expand(i), 200, true)(id);
    },

    collapse(id: string | number) {
        this._setExpandState(id, false);
    },

    // 结构操作
    move(id: string | number, targetPid: string | number | null) {
        return this._moveNode(id, targetPid);
    },

    // 数据获取与同步
    refresh(pid: string | number | null) {
        return this.debounce('refresh', (p: string | number | null) => this._refreshChildren(p), 300, true)(pid);
    },

    getSubTree(pid: string | number) {
        return this.state.getChildren(pid);
    },

    isDirty(currentItem: any) {
        return this.state.isDirty(currentItem);
    },

    edit(item: any) {
        return this.state.edit(item);
    },

    rollback() {
        return this.state.rollback();
    },

    // ---- 内部方法 ----

    _setExpandState(id: string | number, expanded: boolean): void {
        const state = this.state;
        state.toggleExpand(id, expanded);
        state.refreshView();
    },

    async _expand(id: string | number): Promise<void> {
        const state = this.state;

        if (!state.isLoaded(id)) {
            await this._refreshChildren(id);
            state.toggleExpand(id, true);
        } else {
            state.toggleExpand(id, true);
            state.refreshView();
        }
    },

    async _refreshChildren(pid: string | number | null): Promise<void> {
        const state = this.state;

        const options = await this.buildOptions('list', { [this.parentIdField]: pid }, null, {});
        const context = await this.fetch('list', options);

        state.syncChildren(pid, context.data.list);

        state.updateData(context.data.list);
        if (pid !== null) {
            this.setLoaded(pid, true);
        }
        state.refreshView();
    },

    async _moveNode(
        id: string | number,
        targetPid: string | number | null
    ): Promise<void> {
        const state = this.state;
        const parentIdField = this.parentIdField;
        const options = await this.buildOptions(
            'update',
            { [state.idField]: id },
            { [parentIdField]: targetPid },
            {}
        );
        await this.fetch('update', options);
        state.moveNode(id, targetPid);
        state.refreshView();
    },
};
