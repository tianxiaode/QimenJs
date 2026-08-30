import { InferDefinitions, type AbilityDefinition, type InferAbilities } from '@/composable';
import {
    EventsAbility,
    DomEventsAbility,
    SystemAbility,
    DebounceAbility,
    PermissionAbility as SystemPermissionAbility,
} from '@/system-abilities';
import {
    AnimationAbility,
    AttributeAbility,
    BadgeAbility,
    FloatAbility,
    I18nAbility,
    TooltipAbility,
    DialogAbility,
    PopoverAbility,
    IndicatorAbility,
    LoadingAbility,
    DragAbility,
    DropAbility,
    LifecycleAbility,
    InitAbility,
    OptionAbility,
    NodeAbility,
    PermissionAbility,
} from './abilities';
import { IComponentCore } from './types';
import { ComponentDefs } from './ComponentDefs';

/** 组件能力注册表，包含所有组件共享的系统能力与组件核心能力 */
export const COMPONENT_ABILITIES = [
    EventsAbility,
    DomEventsAbility,
    SystemAbility,
    SystemPermissionAbility,
    DebounceAbility,

    InitAbility,
    OptionAbility,
    LifecycleAbility,
    NodeAbility,
    AttributeAbility,
    I18nAbility,
    BadgeAbility,
    FloatAbility,
    TooltipAbility,
    DialogAbility,
    PopoverAbility,
    IndicatorAbility,
    LoadingAbility,
    DragAbility,
    DropAbility,
    AnimationAbility,
    PermissionAbility,

    // ChildrenAbility,
] as const satisfies readonly AbilityDefinition[];

/** 组件实例接口，由能力注册表推断能力方法，并扩展生命周期钩子 */
export interface IComponent
    extends
        InferAbilities<typeof COMPONENT_ABILITIES>,
        InferDefinitions<typeof ComponentDefs>,
        IComponentCore {}
