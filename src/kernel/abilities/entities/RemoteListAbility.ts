import { AbilityBase } from '../../composable';
import { IEntityManagerBase, IExposeResult } from '../../types';
import { debounce } from '@orbitjs/async';

/**
 * RemoteListAbility - 远程列表能力
 * 
 * 提供从远程服务器获取实体列表的能力，支持缓存、防抖和请求取消功能。
 * 该能力通过封装 fetch 请求，实现了缓存优先策略，并在组件销毁时自动清理资源。
 * 
 * @template T - 实体类型，表示列表中包含的项目类型
 * @template TCriteria - 搜索字段类型，表示用于过滤和分页的请求参数结构
 */
export class RemoteListAbility<T, TCriteria> extends AbilityBase<IEntityManagerBase> {
    /**
     * 防抖处理的列表加载函数
     * 
     * 使用 debounce 包装实际的运行逻辑，避免频繁请求
     * 防抖时间为 300ms，适用于连续触发的列表刷新场景
     */
    private debouncedList = debounce(
        (forceRefresh: boolean, resolve: (val: any[]) => void, reject: (err: any) => void) => {
            this.actualRun(forceRefresh).then(resolve).catch(reject);
        },
        300
    );

    /**
     * 暴露外部可调用的方法
     * 
     * 通过此方法向宿主对象暴露远程列表获取能力
     * 
     * @returns 包含 list 方法的对象，供外部调用获取数据
     */
    protected expose(): IExposeResult {
        const { host } = this;

        return {
            /**
             * 获取实体列表
             * 
             * 请求远程数据或返回缓存数据（除非强制刷新）
             * 支持防抖机制，避免短时间内多次重复请求
             * 
             * @param forceRefresh - 是否强制刷新，忽略缓存直接请求远程数据
             * @returns Promise<T[]> 返回实体数组的 Promise
             * 
             * @example
             * ```ts
             * const items = await entity.list();
             * const freshItems = await entity.list(true); // 强制刷新
             * ```
             */
            list: (forceRefresh: boolean = false): Promise<T[]> => {
                return new Promise((resolve, reject) => {
                    this.debouncedList(forceRefresh, resolve, reject);
                });
            },
        };
    }

    /**
     * 实际执行列表获取逻辑
     * 
     * 包含缓存策略和远程请求的核心实现
     * 
     * @param forceRefresh - 是否强制刷新，跳过缓存检查
     * @returns Promise<T[]> 返回获取到的实体数组
     * 
     * 执行流程：
     * 1. 检查是否需要强制刷新
     * 2. 尝试从缓存读取数据（如存在且非强制刷新）
     * 3. 缓存未命中则发起远程请求
     * 4. 更新状态和缓存
     * 5. 返回结果
     */
    private async actualRun(forceRefresh: boolean): Promise<T[]> {
        // 注：TC 已重命名为 TCriteria，但当前逻辑未直接使用该类型参数
        // 后续如需传递查询参数，可在 host.fetch 中扩展 params 支持
        const { host } = this;
        const state = host.state;

        // 缓存优先策略：如果不需要强制刷新，先尝试使用缓存数据
        if (!forceRefresh) {
            const cached = state.tryGetCache();
            if (cached) {
                // 使用缓存数据更新视图状态
                state.updateView(cached.items, cached.total);
                return cached.items;
            }
        }

        // 发起远程请求获取最新数据
        const result = await host.fetch('list', {}, (data: any) => {
            // 解析响应数据，兼容多种数据格式
            const items = data.list || data.items || data || [];
            const total = data.total || 0;

            // 更新视图状态并设置缓存
            state.updateView(items, total);
            state.setCache(items, total);
        });

        // 返回从响应中提取的列表数据，提供默认值防止错误
        return result.data?.list || [];
    }

    /**
     * 资源清理与销毁逻辑
     * 
     * 在能力被销毁时调用，用于清理定时器、取消请求等操作
     * 防止内存泄漏和不必要的网络请求
     */
    public onDispose(): void {
        const { host } = this;

        // A. 取消任何待执行的防抖任务
        // 防止在组件销毁后仍然执行延迟的任务
        if (this.debouncedList && (this.debouncedList as any).cancel) {
            (this.debouncedList as any).cancel();
        }

        // B. 取消所有正在进行的网络请求
        // 通过 AbortController 中断尚未完成的请求
        // 避免在组件已销毁的情况下处理响应
        host.cancelAll?.();

        // 记录调试日志，便于追踪能力生命周期
        host.logger.debug('RemoteListAbility disposed.');
    }
}
