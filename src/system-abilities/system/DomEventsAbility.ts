import type { 
    IEventAdapter,
    BindOptions,
    GestureSemantic,
} from '../types/abilities';
import type { AbilityDefinition } from '@/composable';
import { createEventAdapter } from '@/event-dom';

/**
 * DomEventsAbility - DOM事件能力
 * 
 * 为宿主提供绑定DOM事件的能力，创建事件适配器来处理各种手势事件。
 * this 指向宿主（ComposableBase），this.eventScope 可直接访问。
 */
export const DomEventsAbility: AbilityDefinition = {
    /**
     * 绑定DOM事件到目标元素
     */
    bind(target: EventTarget, semantic: GestureSemantic, options?: BindOptions) {
        const adapter = this.abilityState('DomEventsAbility:adapter', () => createEventAdapter());
        return adapter.bind(target, semantic, this.eventScope, options, this);
    },
};
