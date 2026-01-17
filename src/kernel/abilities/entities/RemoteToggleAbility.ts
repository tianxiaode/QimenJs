import { AbilityBase } from '../../composable';
import { IEntityManagerBase, IExposeResult } from '../../types';
import { debounce } from '@orbitjs/async';

export class RemoteToggleAbility<T, TC> extends AbilityBase<IEntityManagerBase> {
    /**
     * 影子存储：ID -> 对应的防抖函数对象 { run, cancel }
     */
    private debouncerMap = new Map<string, any>();

    protected expose(): IExposeResult {
        const { host } = this;

        return {
            toggle: async (id: any, field: keyof T): Promise<void> => {
                const idKey = host.schemaKeys.id;
                const items = host.state.items || [];
                const item = items.find((i: any) => i[idKey] === id);
                if (!item) return;

                // 1. 生成唯一的 Task Key (支持同一 ID 不同字段的切换隔离)
                const taskKey = `${id}-${String(field)}`;

                // 2. 乐观更新：先记录旧值，立即更新 UI
                const oldValue = (item as any)[field];
                const newValue = typeof oldValue === 'boolean' ? !oldValue : (oldValue ? 0 : 1);
                (item as any)[field] = newValue;

                // 3. 获取或创建该 ID 的专属防抖执行器
                let task = this.debouncerMap.get(taskKey);

                if (!task) {
                    // 参考你提供的逻辑：创建带 Promise 的执行函数
                    // 这里假设你的自定义 debounce 返回一个函数，该函数带有 .cancel 方法
                    task = debounce((currentId: any, val: any, originalVal: any) => {
                        host.fetch('toggle', { id: currentId, data: { [field]: val } })
                            .then(() => {
                                host.emit('toggled', { id: currentId, field, value: val });
                            })
                            .catch(err => {
                                // 失败回滚
                                (item as any)[field] = originalVal;
                                host.emit('toggle-error', err);
                            })
                            .finally(() => {
                                this.debouncerMap.delete(taskKey);
                            });
                    }, 400);

                    this.debouncerMap.set(taskKey, task);
                }

                // 4. 执行防抖函数 (如果 400ms 内再次调用，之前的会被 cancel 或重置计时)
                task(id, newValue, oldValue);
            }
        };
    }

    public onDispose(): void {
        // 销毁时清理所有飞行中的 Toggle 请求
        this.debouncerMap.forEach(task => {
            if (task.cancel) task.cancel();
        });
        this.debouncerMap.clear();
    }
}
