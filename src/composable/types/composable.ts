/**
 * 可组合能力系统类型定义
 */

import type { ILogger } from '@qimenjs/logger';

// ============================================
// 基础接口
// ============================================

/**
 * 可组合基类接口
 *
 * 工厂函数内置方法签名，所有强类实例均满足此接口。
 */
export interface IComposableBase {
    /**
     * 日志记录器
     */
    logger: ILogger;

    /**
     * 获取宿主对象自身
     */
    readonly host: any;

    /**
     * 获取能力私有状态
     */
    abilityState<T>(key: string, creator?: () => T): T | undefined;

    /**
     * 设置能力私有状态
     */
    setAbilityState<T>(key: string, value: T): void;

    /**
     * 注册释放回调（dispose 时 LIFO 调用）
     */
    onCleanup(callback: () => void): void;

    /**
     * 释放资源
     */
    dispose(): void;

    /**
     * 动态属性
     */
    [key: string]: any;
}

// ============================================
// 暴露结果类型
// ============================================

/**
 * Ability 暴露给 Host 的属性描述符扩展
 */
export type ExposeValue = PropertyDescriptor | any;

/**
 * 暴露清单接口
 */
export interface IExposeResult {
    [key: string | symbol]: ExposeValue;
}

// ============================================
// 兼容类型（旧版迁移过渡期保留）
// ============================================

/**
 * 可组合接口
 * @deprecated 旧版接口，新架构不再使用
 */
export interface IComposable {
    attach: (host: any) => void;
    dispose?: () => void;
}
