import { AbilityBase } from '../../composable';
import { IEntityManagerBase, IExposeResult } from '../../types';
import { debounce } from '@orbitjs/async';

export class RemoteGetAbility<T, TC> extends AbilityBase<IEntityManagerBase> {
    private debouncer = debounce(
        (id: any, resolve: (val: T) => void, reject: (err: any) => void) => {
            this.host
                .fetch('get', id, data => {
                    // 自动更新状态：这里假设 data.item 是后端约定的详情结构
                    this.host.state.item = data.item;
                })
                .then((res: any) => resolve(res.data?.item || res.data))
                .catch(reject);
        },
        300
    );

    protected expose(): IExposeResult {
        return {
            /** * 改名为 fetchItem 避免冲突
             * 调用方式: const item = await this.fetchItem(123);
             */
            get: (id: any): Promise<T> => {
                return new Promise((resolve, reject) => {
                    this.debouncer(id, resolve, reject);
                });
            },
        };
    }

    public onDispose(): void {
        if ((this.debouncer as any).cancel) {
            (this.debouncer as any).cancel();
        }
    }
}
