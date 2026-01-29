import {
    IBaseEntityManager,
    IEntity,
    IExposeResult,
    ITreeRemoteEntityStateExtenstion,
    ITreeSearchParams,
} from '../../../types';
import { DebounceAbilityBase } from '../../../composable';

export class TreeManagerAbility<
    T extends IEntity,
    TSearch extends ITreeSearchParams,
    TState extends ITreeRemoteEntityStateExtenstion<T, TSearch>,
> extends DebounceAbilityBase<IBaseEntityManager<T, TSearch, TState>> {
    protected expose(): IExposeResult {
        return {
            // 基础操作
            expand: (id: string | number) => this.expand(id),
            collapse: (id: string | number) => this.setExpandState(id, false),

            // 结构操作
            move: (id: string | number, targetPid: string | number | null) =>
                this.host.moveNode(id, targetPid),

            // 数据获取与同步
            refresh: (pid: string | number | null) => this.refreshChildren(pid),
            getSubTree: (pid: string | number) => this.host.state.getChildren(pid),
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

        // 1. 核心判断：是否已经加载过子节点？
        // 注意：即使 node.leaf 是 true，如果业务允许它动态变目录，
        // 我们也可以在这里只根据 isLoaded 判断。
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
     * 替代了之前在 fetch 里的 updater 回调逻辑
     */
    protected async refreshChildren(pid: string | number | null): Promise<void> {
        const host = this.host;
        const state = host.state;

        // 1. 远程获取（fetch 内部已移除了 updater，职责更清爽）
        const options = await host.buildOptions('list', { [host.parentIdField]: pid }, null, {});
        const context = await host.fetch('list', options);

        state.syncChildren(pid, context.data.list);

        // 3. 覆盖写入与路径重算
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
