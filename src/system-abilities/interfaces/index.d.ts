/**
 * 系统能力接口定义
 *
 * 为每个能力类提供接口，方便类型标注和智能提示
 */
import type { EventHandler } from '@/events';
/**
 * 事件能力接口
 *
 * @description
 * 提供事件监听、一次性监听和事件发射的能力
 *
 * @example
 * ```typescript
 * class MyComponent implements IEventAbility {
 *     // 实现事件能力方法
 * }
 * ```
 */
export interface IEventAbility {
    /**
     * 监听事件
     *
     * @param event - 事件名称
     * @param handler - 事件处理器
     */
    on(event: string, handler: EventHandler): void;
    /**
     * 监听一次性事件
     *
     * @param event - 事件名称
     * @param handler - 事件处理器
     */
    once(event: string, handler: EventHandler): void;
    /**
     * 发射事件
     *
     * @param event - 事件名称
     * @param data - 事件数据
     */
    emit(event: string, data?: any): void;
}
/**
 * DOM 事件能力接口
 *
 * @description
 * 提供DOM事件绑定和处理的能力
 *
 * @example
 * ```typescript
 * class MyComponent implements IDomEventsAbility {
 *     // 实现DOM事件能力方法
 * }
 * ```
 */
export interface IDomEventsAbility {
    /**
     * 绑定DOM事件
     *
     * @param target - 目标元素
     * @param semantic - 事件语义
     * @param handler - 事件处理器
     * @param options - 绑定选项
     */
    bind(target: Element | Window | Document, semantic: string, handler: EventHandler, options?: {
        selector?: string;
        debounce?: number;
        throttle?: number;
        preventDefault?: boolean;
        stopPropagation?: boolean;
    }): void;
    /**
     * 解绑DOM事件
     *
     * @param target - 目标元素
     * @param semantic - 事件语义
     * @param handler - 事件处理器
     */
    unbind(target: Element | Window | Document, semantic: string, handler?: EventHandler): void;
}
/**
 * 域能力接口
 *
 * @description
 * 提供域配置和管理的能力
 *
 * @example
 * ```typescript
 * class MyComponent implements IDomainAbility {
 *     // 实现域能力方法
 * }
 * ```
 */
export interface IDomainAbility {
    /**
     * 获取域配置
     *
     * @returns 域配置对象
     */
    getDomain(): any;
    /**
     * 设置域配置
     *
     * @param domain - 域配置对象
     */
    setDomain(domain: any): void;
}
/**
 * 系统能力接口
 *
 * @description
 * 提供系统级配置和管理的能力
 *
 * @example
 * ```typescript
 * class MyComponent implements ISystemAbility {
 *     // 实现系统能力方法
 * }
 * ```
 */
export interface ISystemAbility {
    /**
     * 获取系统配置
     *
     * @returns 系统配置对象
     */
    getSystemConfig(): any;
    /**
     * 设置系统配置
     *
     * @param config - 系统配置对象
     */
    setSystemConfig(config: any): void;
}
/**
 * 组合能力接口
 *
 * @description
 * 常用的能力组合
 */
/**
 * 事件 + 域能力
 */
export interface IEventDomainAbility extends IEventAbility, IDomainAbility {
}
/**
 * 事件 + DOM事件能力
 */
export interface IEventDomAbility extends IEventAbility, IDomEventsAbility {
}
/**
 * 完整系统能力
 */
export interface IFullSystemAbility extends IEventAbility, IDomEventsAbility, IDomainAbility, ISystemAbility {
}
//# sourceMappingURL=index.d.ts.map