import {
    ComposableEntry,
    DomainAbilityName,
    DomEventsAbilityName,
    EventAbilityName,
    SystemAbilityName,
} from '../../types';
import { EventAbility } from './EventAbility';
import { DomEventsAbility } from './DomEventsAbility';
import { DomainAbility } from './DomainAbility';
import { SystemAbility } from './SystemAbility';

export const EventAbilityEntry: ComposableEntry = {
    name: EventAbilityName,
    description: '为类添加事件能力',
    ctor: EventAbility,
};

export const DomEventsAbilityEntry: ComposableEntry = {
    name: DomEventsAbilityName,
    description: '为类添加DOM事件能力',
    deps: [EventAbilityName],
    ctor: DomEventsAbility,
};

export const DomainConfigAbilityEntry: ComposableEntry = {
    name: DomainAbilityName,
    description: '为类添加域配置能力',
    ctor: DomainAbility,
};

export const SystemConfigAbilityEntry: ComposableEntry = {
    name: SystemAbilityName,
    description: '为类添加系统配置能力',
    ctor: SystemAbility,
};
