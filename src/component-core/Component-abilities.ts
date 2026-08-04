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
import { FloatAbility } from './abilities/FloatAbility';
import { DragAbility } from './abilities/DragAbility';
import { LifecycleAbility } from './abilities/LifecycleAbility';

import type { ComponentProps } from './types/init-context';

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
    FloatAbility,
    DragAbility,

    LifecycleAbility,

] as const satisfies readonly AbilityDefinition[];

export interface IComponent extends InferAbilities<typeof COMPONENT_ABILITIES> {
    onBeforeUnmount?(): void;
    onAfterInit?(props?: ComponentProps): void;
    onBeforeInit?(props?: ComponentProps): void;
    onMounted?(): void;
    onUpdated?(data?: any): void;
    onResize?(entry: ResizeObserverEntry): void;

    onLocaleChange?(): void;
    onPermissionChange?(data?: any): void;
}
