import { AbilityBase } from '../../composable';
import { IEntityManagerBase, IExposeResult } from '../../types';
import { debounce } from '@orbitjs/async';

export class RemoteListAbility<T, TC> extends AbilityBase<IEntityManagerBase> {
    // 1. 定义防抖函数，包装真正的执行逻辑
    private debouncedList = debounce(
        (forceRefresh: boolean, resolve: (val: any[]) => void, reject: (err: any) => void) => {
            this.actualRun(forceRefresh).then(resolve).catch(reject);
        },
        300
    );

    protected expose(): IExposeResult {
        const { host } = this;

        // 2. 注入 list 方法，调用防抖执行器
        return {
            list: (forceRefresh: boolean = false): Promise<T[]> => {
                return new Promise((resolve, reject) => {
                    this.debouncedList(forceRefresh, resolve, reject);
                });
            },
        };
    }

    /**
     * 真正的执行逻辑
     */
    private async actualRun(forceRefresh: boolean): Promise<T[]> {
        const { host } = this;
        const state = host.state;

        // 缓存优先策略
        if (!forceRefresh) {
            const cached = state.tryGetCache();
            if (cached) {
                state.updateView(cached.items, cached.total);
                return cached.items;
            }
        }

        // 发起远程请求
        const result = await host.fetch('list', {}, (data: any) => {
            const items = data.list || data.items || data || [];
            const total = data.total || 0;

            state.updateView(items, total);
            state.setCache(items, total);
        });

        // 这里的返回要根据你 FlowContext 的结构来
        return result.data?.list || [];
    }

    /**
     * 3. 释放逻辑
     */
    public onDispose(): void {
        const { host } = this;

        // A. 取消还没开始的防抖任务
        if (this.debouncedList && (this.debouncedList as any).cancel) {
            (this.debouncedList as any).cancel();
        }

        // B. 如果你想更彻底，可以在这里取消当前正在进行的网络请求
        // 这样当 Ability 卸载时，还没回来的请求会被 Abort
        host.cancelAll?.();

        host.logger.debug('RemoteListAbility disposed.');
    }
}
