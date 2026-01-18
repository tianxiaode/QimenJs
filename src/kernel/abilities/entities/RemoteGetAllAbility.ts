import { AbilityBase } from '../../composable';
import { IEntityManagerBase, IExposeResult } from '../../types';
import { debounce } from '@orbitjs/async';

/**
 * RemoteGetAllAbility - 远程获取全部实体的能力
 * 
 * 提供从服务器远程获取所有实体数据的能力，通过 fetch 方法与后端交互。
 * 使用防抖机制避免频繁请求，适用于字典表、配置项等小数据量的全量拉取场景。
 * 
 * @template T - 实体类型
 * @template TC - 搜索字段类型
 */
export class RemoteGetAllAbility<T, TC> extends AbilityBase<IEntityManagerBase> {
    /**
     * 防抖处理的获取数据方法
     * 
     * 使用 300ms 防抖间隔，防止短时间内多次触发请求。
     * 在防抖期间如果再次调用，会取消之前的请求，只执行最后一次。
     */
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

    /**
     * 暴露外部可调用的方法
     * 
     * @returns 返回包含 getAll 方法的对象，供外部使用
     */
    protected expose(): IExposeResult {
        return {
            /**
             * 获取所有实体数据
             * 
             * 发起远程请求获取全部数据，适用于小数据量的全量同步场景。
             * 自动应用防抖机制（300ms），避免频繁请求。
             * 成功时返回数据列表并更新本地状态，失败时抛出错误。
             * 
             * @returns Promise<T[]> 包含所有实体的 Promise
             * 
             * @example
             * ```ts
             * entity.getAll().then(items => {
             *   console.log('获取到所有项目:', items);
             * });
             * ```
             */
            getAll: (): Promise<T[]> => {
                return new Promise((resolve, reject) => {
                    this.debouncedFetch(resolve, reject);
                });
            },
        };
    }

    /**
     * 资源销毁时的清理工作
     * 
     * 取消任何待处理的防抖请求，防止内存泄漏。
     * 输出调试日志，便于追踪能力生命周期。
     */
    public onDispose(): void {
        this.debouncedFetch.cancel();
        this.host.logger.debug('RemoteGetAllAbility cancelled and disposed.');
    }
}
