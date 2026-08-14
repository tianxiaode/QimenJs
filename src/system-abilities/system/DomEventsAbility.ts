import type { BindOptions, GestureSemantic } from '../types/abilities';
import type { InputSignal } from '@qimenjs/event-dom';
import type { AbilityDefinition } from '@/composable';
import { createEventAdapter } from '@qimenjs/event-dom';

/**
 * DomEventsAbility - DOM事件能力
 *
 * 为宿主提供绑定DOM事件的能力，创建事件适配器来处理各种事件。
 * 支持两种语义：
 * - GestureSemantic（click/tap/swipe 等）：走 Processor 流程
 * - InputSignal（input/change/focus/blur 等）：直接绑定
 *
 * this 指向宿主（ComposableBase），this.eventScope 可直接访问。
 */
export const DomEventsAbility = {
    /**
     * 绑定DOM事件到目标元素
     *
     * @param target 事件目标元素
     * @param semantic 事件语义（GestureSemantic 或 InputSignal）
     * @param options 绑定选项
     */
    bind(target: EventTarget, semantic: GestureSemantic | InputSignal, options?: BindOptions) {
        this.logger?.debug?.(
            '[DomEvents] bind, semantic =',
            semantic,
            'scopeType =',
            this.eventScope?.constructor?.name,
            'scopeId =',
            this.eventScope?.getScopeId?.()
        );
        const adapter = this.abilityState('DomEventsAbility:adapter', () => createEventAdapter());
        return adapter.bind(target, semantic, this.eventScope, options, this);
    },
} satisfies AbilityDefinition;
