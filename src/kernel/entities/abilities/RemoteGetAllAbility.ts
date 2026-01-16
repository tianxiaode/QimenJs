import { AbilityBase } from '../../composable';
import { IEntityManagerBase } from '../../types';
import { debounce } from '@orbitjs/async';

export class RemoteGetAllAbility extends AbilityBase<IEntityManagerBase> {
    private debouncer: any = null;

    protected onAttach(): void {
        const {host} = this;
        const {state} = host;
        // 注入 getAll 方法
        host.getAll = (params?: any) => {
            // 如果已经有在排队的请求，会被防抖拦截
            if (!this.debouncer) {
                this.debouncer = debounce((res, rej, currentParams) => {
                    // 调用 EntityManagerBase 提供的 fetch 核心
                    host.fetch('getall', currentParams, (data) => {
                        // 约定：getAll 的结果通常存放在 list 中
                        state.items = data.list || [];
                        state.total = data.total || data.list?.length || 0;
                    })
                    .then(res)
                    .catch(rej)
                    .finally(() => {
                        // 逻辑执行完后，并不一定需要销毁 debouncer，
                        // 但对于 getAll，通常 300ms 内的多次调用只触发一次
                    });
                }, 300);
            }

            return new Promise((res, rej) => this.debouncer(res, rej, params));
        };
    }

    public onDispose(): void {
        if (this.debouncer) {
            this.debouncer.cancel?.();
            this.debouncer = null;
        }
        delete this.host.getAll;
    }
}