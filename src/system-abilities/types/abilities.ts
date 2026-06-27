/**
 * 系统能力类型定义
 */

/**
 * 能力名称常量
 */
export const EventAbilityName = 'EventAbility';
export const DomEventsAbilityName = 'DomEventsAbility';
export const DomainAbilityName = 'DomainAbility';
export const SystemAbilityName = 'SystemAbility';

/**
 * Domain 缓存 Symbol
 */
export const DOMAIN_CACHE_SYMBOL = Symbol('domain-config-cache');

/**
 * 系统能力名称类型
 */
export type SystemAbilityNameType = 
    | typeof EventAbilityName
    | typeof DomEventsAbilityName
    | typeof DomainAbilityName
    | typeof SystemAbilityName;

/**
 * 事件适配器接口
 */
export interface IEventAdapter {
    bind(target: any, semantic: any, scope: any, options?: any, host?: any): any;
    on(event: string, handler: Function): void;
    off(event: string, handler?: Function): void;
    emit(event: string, data?: any): void;
}

/**
 * 绑定选项
 */
export interface BindOptions {
    selector?: string;
    debounce?: number;
    throttle?: number;
    preventDefault?: boolean;
    stopPropagation?: boolean;
}

/**
 * 手势语义
 */
export type GestureSemantic = 
    | 'tap'
    | 'doubletap'
    | 'longpress'
    | 'swipe'
    | 'swipeleft'
    | 'swiperight'
    | 'swipeup'
    | 'swipedown'
    | 'pinch'
    | 'rotate';
