import { DebounceAbilityBase, type IExposeResult, type AbilityProxy } from '@/composable';

export class TreeManagerAbility extends DebounceAbilityBase {
    protected expose(proxy: AbilityProxy): IExposeResult {
        const state = proxy.host.state;

        // expand 使用防抖：快速展开多个节点时合并请求
        const debouncedExpand = proxy.self.getDebouncedAction(
            'expand',
            (id: string | number) => proxy.self.expand(id),
            200,
            true  // leading: 首次立即执行，快速响应
        );

        // refresh 使用防抖：快速刷新多个父节点时合并请求
        const debouncedRefresh = proxy.self.getDebouncedAction(
            'refresh',
            (pid: string | number | null) => proxy.self.refreshChildren(pid),
            300,
            true  // leading: 首次立即执行
        );

        return {
            // 基础操作
            expand: (id: string | number) => debouncedExpand(id),
            collapse: (id: string | number) => proxy.self.setExpandState(id, false),

            // 结构操作
            move: (id: string | number, targetPid: string | number | null) =>
                proxy.self.moveNode(id, targetPid),
            // 数据获取与同步
            refresh: (pid: string | number | null) => debouncedRefresh(pid),
            getSubTree: (pid: string | number) => proxy.host.state.getChildren(pid),
            isDirty: (currentItem: any) => state.isDirty(currentItem),
            edit: (item: any) => state.edit(item),
            rollback: () => state.rollback(),
        };
    }

    /**
     * 设置展开/折叠状态
     */
    protected setExpandState(id: string | number, expanded: boolean): void {
        const host = this.host;
        const state = host.state;
        state.toggleExpand(id, expanded);
        state.refreshView();
    }

    protected async expand(id: string | number): Promise<void> {
        const host = this.host;
        const state = host.state;

        if (!state.isLoaded(id)) {
            await this.refreshChildren(id);
            state.toggleExpand(id, true);
        } else {
            state.toggleExpand(id, true);
            state.refreshView();
        }
    }

    /**
     * 核心方法：刷新子节点
     */
    protected async refreshChildren(pid: string | number | null): Promise<void> {
        const host = this.host;
        const state = host.state;

        const options = await host.buildOptions('list', { [host.parentIdField]: pid }, null, {});
        const context = await host.fetch('list', options);

        state.syncChildren(pid, context.data.list);

        state.updateData(context.data.list);
        if (pid !== null) {
            host.setLoaded(pid, true);
        }
        state.refreshView();
    }

    protected async moveNode(
        id: string | number,
        targetPid: string | number | null
    ): Promise<void> {
        const host = this.host;
        const state = host.state;
        const parentIdField = host.parentIdField;
        const options = await host.buildOptions(
            'update',
            { [state.idField]: id },
            { [parentIdField]: targetPid },
            {}
        );
        const context = await host.fetch('update', options);
        state.moveNode(id, targetPid);
        state.refreshView();
    }
}
