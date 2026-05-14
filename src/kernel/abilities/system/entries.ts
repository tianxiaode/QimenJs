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

/**
 * 事件能力入口定义
 * 为类添加事件发射和监听能力
 */
export const EventAbilityEntry: ComposableEntry = {
    name: EventAbilityName,
    description: '为类添加事件能力',
    abilityClass: EventAbility,  // ← 构造函数，不是实例
};

/**
 * DOM事件能力入口定义
 * 为类添加DOM事件绑定和处理能力
 */
export const DomEventsAbilityEntry: ComposableEntry = {
    name: DomEventsAbilityName,
    description: '为类添加DOM事件能力',
    deps: [EventAbilityName],
    abilityClass: DomEventsAbility,  // ← 构造函数，不是实例
};

/**
 * 域配置能力入口定义
 * 为类添加域相关的配置和管理能力
 */
export const DomainConfigAbilityEntry: ComposableEntry = {
    name: DomainAbilityName,
    description: '为类添加域配置能力',
    abilityClass: DomainAbility,  // ← 构造函数，不是实例
};

/**
 * 系统配置能力入口定义
 * 为类添加系统级配置和管理能力
 */
export const SystemConfigAbilityEntry: ComposableEntry = {
    name: SystemAbilityName,
    description: '为类添加系统配置能力',
    abilityClass: SystemAbility,  // ← 构造函数，不是实例
};
