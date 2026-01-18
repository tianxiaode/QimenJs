import { AbilityBase } from '../../composable';
import { IEntityManagerBase, IExposeResult } from '../../types';
import { debounce } from '@orbitjs/async';

/**
 * RemoteToggleAbility - 远程状态切换能力
 *
 * 允许对实体的布尔字段进行远程切换操作（如启用/禁用），支持：
 * - 乐观 UI 更新（立即响应，提升用户体验）
 * - 防抖提交（避免频繁请求）
 * - 操作失败自动回滚
 * - 支持同一资源不同字段独立控制
 *
 * @template T 实体数据类型
 * @template TCriteria 搜索字段类型（用于条件筛选等场景，当前主要用于扩展性预留）
 */
export class RemoteToggleAbility<T, TCriteria> extends AbilityBase<IEntityManagerBase> {
    /**
     * 存储每个字段切换任务的防抖函数实例
     * 使用 Map 以 taskKey (id-field) 为键，确保不同字段独立防抖
     *
     * @private
     * @type {Map<string, { run: Function; cancel: Function }>}
     */
    private debouncerMap = new Map<string, any>();

    /**
     * 暴露可被外部调用的方法集合
     *
     * @protected
     * @returns {IExposeResult} 包含 toggle 方法的对象
     */
    protected expose(): IExposeResult {
        const { host } = this;

        return {
            /**
             * 切换指定实体某字段的布尔状态
             *
             * 流程：
             * 1. 乐观更新本地 UI 状态
             * 2. 启动 400ms 防抖定时器提交到服务器
             * 3. 成功则触发 'toggled' 事件
             * 4. 失败则回滚 UI 并触发 'toggle-error' 事件
             *
             * @param {any} id - 实体唯一标识符
             * @param {keyof T} field - 要切换的字段名（必须是布尔或类布尔值）
             * @returns {Promise<void>}
             *
             * @example
             * entity.toggle('123', 'enabled');
             */
            toggle: async (id: any, field: keyof T): Promise<void> => {
                const idKey = host.schemaKeys.id;
                const items = host.state.items || [];
                const item = items.find((i: any) => i[idKey] === id);
                if (!item) return;

                // 1. 生成唯一的 Task Key，实现同一 ID 不同字段的切换隔离
                const taskKey = `${id}-${String(field)}`;

                // 2. 乐观更新：记录旧值，并立即更新 UI 上的字段值
                const oldValue = (item as any)[field];
                const newValue = typeof oldValue === 'boolean' ? !oldValue : oldValue ? 0 : 1;
                (item as any)[field] = newValue;

                // 3. 获取或创建该字段的专属防抖执行器
                let task = this.debouncerMap.get(taskKey);

                if (!task) {
                    // 创建防抖函数：延迟提交请求，避免高频操作
                    task = debounce(
                        (currentId: any, val: any, originalVal: any) => {
                            host
                                .fetch('toggle', { id: currentId, data: { [field]: val } })
                                .then(() => {
                                    // 提交成功，通知外部
                                    host.emit('toggled', { id: currentId, field, value: val });
                                })
                                .catch((err) => {
                                    // 请求失败，回滚 UI 状态
                                    (item as any)[field] = originalVal;
                                    host.emit('toggle-error', err);
                                })
                                .finally(() => {
                                    // 清理已完成的任务
                                    this.debouncerMap.delete(taskKey);
                                });
                        },
                        400 // 400ms 防抖窗口
                    );

                    this.debouncerMap.set(taskKey, task);
                }

                // 4. 触发防抖逻辑（若短时间内重复调用，前序请求将被取消）
                task(id, newValue, oldValue);
            }
        };
    }

    /**
     * 组件销毁时的清理逻辑
     * 取消所有尚未完成的防抖请求，防止内存泄漏或无效回调
     *
     * @public
     */
    public onDispose(): void {
        this.debouncerMap.forEach((task) => {
            if (task.cancel) task.cancel();
        });
        this.debouncerMap.clear();
    }
}
