/**
 * ComponentEntityDispatch — 组件实体调度中心
 *
 * 封装实体事件的"发射 + 订阅"完整流程。
 * EventForwarder._forwardEntities 调用 dispatch 完成转发与订阅，
 * EntityActionAbility 的便捷方法也通过 dispatch 实现。
 */

/** 实体操作动作-事件映射表，定义每个操作对应的 success/error/loading 事件名 */
export const ACTION_PAIRS: Record<string, { success: string; error: string; loading: string }> = {
    connect: { success: 'connected', error: 'connect:error', loading: 'connect:loading' },
    list: { success: 'listed', error: 'list:error', loading: 'list:loading' },
    get: { success: 'got', error: 'get:error', loading: 'get:loading' },
    getAll: { success: 'listed', error: 'getAll:error', loading: 'getAll:loading' },
    create: { success: 'created', error: 'create:error', loading: 'create:loading' },
    update: { success: 'updated', error: 'update:error', loading: 'update:loading' },
    delete: { success: 'deleted', error: 'delete:error', loading: 'delete:loading' },
    toggle: { success: 'toggled', error: 'toggle:error', loading: 'toggle:loading' },
    save: { success: 'saved', error: 'save:error', loading: 'save:loading' },
    batchDelete: { success: 'deleted', error: 'batchDelete:error', loading: 'batchDelete:loading' },
    filter: { success: 'listed', error: 'filter:error', loading: 'filter:loading' },
    sort: { success: 'listed', error: 'sort:error', loading: 'sort:loading' },
    refresh: { success: 'listed', error: 'refresh:error', loading: 'refresh:loading' },
    searchBy: { success: 'listed', error: 'searchBy:error', loading: 'searchBy:loading' },
    reset: { success: 'listed', error: 'reset:error', loading: 'reset:loading' },
    prev: { success: 'listed', error: 'prev:error', loading: 'prev:loading' },
    next: { success: 'listed', error: 'next:error', loading: 'next:loading' },
    jump: { success: 'listed', error: 'jump:error', loading: 'jump:loading' },
    changeSize: { success: 'listed', error: 'changeSize:error', loading: 'changeSize:loading' },
    expand: { success: 'listed', error: 'expand:error', loading: 'expand:loading' },
    collapse: { success: 'listed', error: 'collapse:error', loading: 'collapse:loading' },
};

/** 组件实体调度中心，封装实体事件的发射+订阅完整流程 */
export class ComponentEntityDispatch {
    static dispatch(instance: any, entityKey: string, action: string, data?: any): void {
        const pair = ACTION_PAIRS[action];
        if (!pair) {
            instance.logger?.warn?.(`Unknown entity action: ${action}`);
            return;
        }

        let offSuccess: (() => void) | null = null;
        let offError: (() => void) | null = null;
        let offLoading: (() => void) | null = null;

        const cleanup = () => {
            offSuccess?.();
            offError?.();
            offLoading?.();
        };

        offLoading = instance.entityOn(entityKey, pair.loading, () => {
            instance.onEntityLoading?.(entityKey, true);
        });

        offSuccess = instance.entityOn(entityKey, pair.success, (result: any) => {
            cleanup();
            instance.onEntityLoading?.(entityKey, false);
            instance.onEntityActionSuccess?.(result, action, entityKey);
        });

        offError = instance.entityOn(entityKey, pair.error, (ctx: any) => {
            cleanup();
            instance.onEntityLoading?.(entityKey, false);
            instance.onEntityError?.(ctx, instance.domain);
        });

        instance.entityEmit({
            event: action,
            type: action,
            source: entityKey,
            data,
        });
    }
}
