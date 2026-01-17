import { AbilityBase } from '../../composable';
import { IEntityManagerBase, IExposeResult } from '../../types';
import { debounce } from '@orbitjs/async';

export class RemoteGetAllAbility<T, TC> extends AbilityBase<IEntityManagerBase> {
    // 1. 固定防抖器，不再在 expose 里动态创建
    private debouncedFetch = debounce((resolve: (val: any) => void, reject: (err: any) => void) => {
        const { host } = this;
        host.fetch('get-all', {}, (data: any) => {
            const items = data.list || [];
            // getAll 通常直接更新 state.items，作为全量源
            host.state.items = items;
            host.state.total = items.length;
        })
            .then(resolve)
            .catch(reject);
    }, 300);

    protected expose(): IExposeResult {
        return {
            /**
             * getAll: 获取全量数据，不带参数
             * 适合用于字典表、配置项等小数据量的全量拉取
             */
            getAll: (): Promise<T[]> => {
                return new Promise((resolve, reject) => {
                    this.debouncedFetch(resolve, reject);
                });
            },
        };
    }

    public onDispose(): void {
        this.debouncedFetch.cancel();
        this.host.logger.debug('RemoteGetAllAbility cancelled and disposed.');
    }
}
