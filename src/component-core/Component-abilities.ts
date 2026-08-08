import { type AbilityDefinition, type InferAbilities } from '@/composable';
import {
    EventAbility,
    DomEventsAbility,
    ComponentEventBusAbility,
    EntityEventBusAbility,
    OverlayEventBusAbility,
    DragEventBusAbility,
    SystemEventBusAbility,
    FileEventBusAbility,
    SystemAbility,
    DebounceAbility,
} from '@/system-abilities';
import { NodeQueryAbility } from './abilities/NodeQueryAbility';
import { NodePropAbility } from './abilities/NodePropAbility';
import { CommonPropsAbility } from './abilities/CommonPropsAbility';
import { AnimationAbility } from './abilities';
import { BadgeAbility } from './abilities/BadgeAbility';
import { FloatAbility } from './abilities/FloatAbility';
import { DragAbility } from './abilities/DragAbility';
import { LifecycleAbility } from './abilities/LifecycleAbility';
import { IComponentBase } from './types';

/** 组件能力注册表，包含所有组件共享的系统能力与组件核心能力 */
export const COMPONENT_ABILITIES = [
    EventAbility,
    DomEventsAbility,
    ComponentEventBusAbility,
    EntityEventBusAbility,
    OverlayEventBusAbility,
    DragEventBusAbility,
    SystemEventBusAbility,
    FileEventBusAbility,
    SystemAbility,
    DebounceAbility,

    NodeQueryAbility,
    NodePropAbility,
    CommonPropsAbility,
    AnimationAbility,
    BadgeAbility,
    FloatAbility,
    DragAbility,

    LifecycleAbility,
] as const satisfies readonly AbilityDefinition[];

/** 组件实例接口，由能力注册表推断能力方法，并扩展生命周期钩子 */
export interface IComponent extends InferAbilities<typeof COMPONENT_ABILITIES>, IComponentBase {
    onBeforeUnmount?(): void;
    onAfterInit?(): void;
    onBeforeInit?(): void;
    onMounted?(): void;
    onUpdated?(data?: any): void;
    onResize?(entry: ResizeObserverEntry): void;

    onLocaleChange?(): void;
    onPermissionChange?(data?: any): void;
}
