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
import {
    AnimationAbility,
    BadgeAbility,
    FloatAbility,
    DragAbility,
    LifecycleAbility,
    OptionsAbility,
    NodeQueryAbility,
    NodePropAbility,
    CommonPropsAbility,
} from './abilities';
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

    OptionsAbility,

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
export interface IComponent extends InferAbilities<typeof COMPONENT_ABILITIES>, IComponentBase {}
