import { InferDefinitions, type AbilityDefinition, type InferAbilities } from '@/composable';
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
    TooltipAbility,
    DialogAbility,
    PopoverAbility,
    IndicatorAbility,
    LoadingAbility,
    DragAbility,
    DropAbility,
    DomEventDelegateAbility,
    ListensAbility,
    LifecycleAbility,
    InitAbility,
    OptionAbility,
    NodeAbility,
} from './abilities';
import { IComponentCore } from './types';
import { ComponentDefs } from './ComponentDefs';

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
    SystemEventBusAbility,
    DebounceAbility,

    InitAbility,
    OptionAbility,
    LifecycleAbility,
    NodeAbility,
    BadgeAbility,
    FloatAbility,
    TooltipAbility,
    DialogAbility,
    PopoverAbility,
    IndicatorAbility,
    LoadingAbility,
    DragAbility,
    DropAbility,
    DomEventDelegateAbility,
    ListensAbility,
    AnimationAbility,

    // ChildrenAbility,
] as const satisfies readonly AbilityDefinition[];

/** 组件实例接口，由能力注册表推断能力方法，并扩展生命周期钩子 */
export interface IComponent
    extends
        InferAbilities<typeof COMPONENT_ABILITIES>,
        InferDefinitions<typeof ComponentDefs>,
        IComponentCore {}
