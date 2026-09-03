/**
 * EntityAbility — 实体交互能力
 *
 * 提供组件与实体通信的回调钩子与默认处理器：
 * - onEntityActionSuccess / onEntityError / onEntityLoading：实体事件分发回调钩子（模板方法）
 * - defaultEntityErrorHandler / defaultEntityLoadingHandler：可被全局替换的默认处理器，
 *   通过 Component.setDefaultHandler() 修改
 *
 * 生命周期语义：onEntityError / onEntityLoading 内部保留
 * onBefore 与 onAfter 钩子，子类可用 overrides 覆写具体回调而不破坏流程。
 */

import type { AbilityDefinition } from '@/composable';

/** 实体交互能力 */
export const EntityAbility: AbilityDefinition = {
    defaultEntityErrorHandler(_ctx: any, _domain: string): void {},

    defaultEntityLoadingHandler(_entityKey: string, isLoading: boolean): void {
        if (isLoading) {
            this.showLoading();
        } else {
            this.hideLoading();
        }
    },

    onEntityActionSuccess(_result: any, _action: string, _entityKey: string) {},

    onEntityError(ctx: any, domain: string) {
        if (this.onBeforeEntityError?.() === false) return;
        this.defaultEntityErrorHandler(ctx, domain);
        this.onAfterEntityError?.();
    },

    onEntityLoading(entityKey: string, isLoading: boolean) {
        if (this.onBeforeEntityLoading?.(entityKey, isLoading) === false) return;
        this.defaultEntityLoadingHandler(entityKey, isLoading);
        this.onAfterEntityLoading?.(entityKey, isLoading);
    },
} satisfies AbilityDefinition;