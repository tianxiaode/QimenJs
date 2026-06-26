// ==================== 系统能力接口 ====================

import { DomainConfig, SystemConfig } from '@orbitjs/registry';
import { GestureSemantic } from '../events';

/**
 * 事件能力接口
 * 提供基本的事件监听、一次性监听和事件发射功能
 */
export interface IEventAbility {
    /**
     * 监听事件
     * @param event 事件名称
     * @param listener 事件处理器函数
     * @returns 取消监听的函数
     */
    on(event: string, listener: Function): () => () => void;

    /**
     * 监听一次性事件
     * @param event 事件名称
     * @param listener 事件处理器函数
     */
    once(event: string, listener: Function): void;

    /**
     * 发射事件
     * @param event 事件名称
     * @param payload 传递的数据（可选）
     */
    emit(event: string, payload?: any): void;
}

/**
 * DOM事件能力接口
 * 提供绑定DOM事件到目标元素的能力
 */
export interface IDomEventsAbility extends IEventAbility {
    /**
     * 绑定DOM事件到目标元素
     * @param target 事件目标元素
     * @param semantic 手势语义类型
     * @param options 绑定选项
     */
    bind(target: EventTarget, semantic: GestureSemantic, options?: any): () => void;
}

/**
 * 域能力接口
 * 提供对域配置的访问能力
 */
export interface IDomainAbility {
    /** 域配置对象 */
    domainConfig: DomainConfig;
}

/**
 * 系统能力接口
 * 提供对系统级配置的访问能力
 */
export interface ISystemAbility {
    /**
     * 获取系统配置
     * @param key 可选的配置项键名
     * @returns 请求的配置值或整个配置对象
     */
    systemConfig<K extends keyof SystemConfig>(key?: K): Partial<SystemConfig> | any;
}
