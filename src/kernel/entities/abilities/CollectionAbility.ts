import { AbilityBase } from '../../composable';
import { IEntityManagerBase } from '../../types';

/**
 * 集合状态能力：将 CollectionState 的核心状态平铺给宿主
 */
export class CollectionAbility extends AbilityBase<IEntityManagerBase> {
    protected onAttach(): void {
        const host = this.host;
        const state = host.state; // 获取 EntityManagerBase 里创建的 state

        if (!state) {
            this.host.logger.error(
                "CollectionState not found on host. Make sure it's initialized in constructor."
            );
            return;
        }

        // 定义视图层需要的只读计算属性
        const viewProps = {
            loading: () => state.loading,
            isEmpty: () => state.items.length === 0,
            hasMore: () => state.pageIndex < state.pageCount,
            total: () => state.total,
            items: () => state.items,
            pageIndex: () => state.pageIndex,
            pageSize: () => state.pageSize,
        };

        // 将这些属性定义到宿主（EM）上
        Object.keys(viewProps).forEach(key => {
            Object.defineProperty(host, key, {
                get: viewProps[key as keyof typeof viewProps],
                enumerable: true,
                configurable: true,
            });
        });

        this.host.logger.debug('Collection view properties proxied to EM.');
    }

    protected onDispose(): void {
        // 清理绑定的属性，防止内存泄漏或错误的逻辑访问
        const props = ['loading', 'isEmpty', 'hasMore', 'total', 'items', 'pageIndex', 'pageSize'];
        props.forEach(p => delete (this.host as any)[p]);
    }
}
