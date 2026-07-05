import type { AbilityDefinition } from '@/composable';
import { globalEventBus, EventHandler } from '@/events';

/**
 * EventAbility - 事件能力
 *
 * 提供事件监听、一次性监听和事件发射的能力。
 * 通过创建独立的事件作用域（event scope）来管理事件，避免全局污染。
 * 每个宿主拥有独立的事件生命周期。
 * this 指向宿主（ComposableBase）。
 */
export const EventAbility: AbilityDefinition = {
    /**
     * 获取当前事件作用域
     */
    eventScope: {
        get() {
            return this.abilityState('EventAbility:scope', () => {
                const scope = globalEventBus.createEventScope();
                this.onCleanup(() => scope.dispose());
                return scope;
            });
        },
    },

    /**
     * 监听事件
     */
    on(event: string, handler: EventHandler) {
        return this.eventScope.on(event, handler);
    },

    /**
     * 监听一次性事件
     */
    once(event: string, handler: EventHandler) {
        return this.eventScope.once(event, handler);
    },

    /**
     * 发射事件
     */
    emit(event: string, data?: any) {
        this.eventScope.emit(event, data, this);
    },
};
