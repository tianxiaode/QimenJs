/**
 * 系统能力自动注册
 * 
 * 将所有系统能力注册到 ComposableRegistrar
 */

import { ComposableRegistrar } from '@/composable';
import {
    EventAbilityEntry,
    DomEventsAbilityEntry,
    DomainConfigAbilityEntry,
    SystemConfigAbilityEntry,
} from './entries';

/**
 * 注册所有系统能力
 * 
 * @param registrar - ComposableRegistrar 实例（可选，默认使用单例）
 */
export function registerSystemAbilities(registrar?: ComposableRegistrar): void {
    const composableRegistrar = registrar || ComposableRegistrar.getInstance();
    
    // 注册事件能力
    composableRegistrar.register(
        { name: EventAbilityEntry.name, ctor: EventAbilityEntry.abilityClass },
        EventAbilityEntry.abilityClass,
        { immediate: false }
    );
    
    // 注册 DOM 事件能力（依赖事件能力）
    composableRegistrar.register(
        { name: DomEventsAbilityEntry.name, ctor: DomEventsAbilityEntry.abilityClass },
        DomEventsAbilityEntry.abilityClass,
        { immediate: false }
    );
    
    // 注册域能力
    composableRegistrar.register(
        { name: DomainConfigAbilityEntry.name, ctor: DomainConfigAbilityEntry.abilityClass },
        DomainConfigAbilityEntry.abilityClass,
        { immediate: false }
    );
    
    // 注册系统能力
    composableRegistrar.register(
        { name: SystemConfigAbilityEntry.name, ctor: SystemConfigAbilityEntry.abilityClass },
        SystemConfigAbilityEntry.abilityClass,
        { immediate: false }
    );
}

/**
 * 自动注册（模块加载时执行）
 */
// registerSystemAbilities();
