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
     * */
    logger: ILogger;
    getPropertyMap(): Map<string, any>;
    getOptionsMap(): Map<string, any>;
    getOption(key: string): any;
    setOption(key: string, value: any, silent?: boolean): void;
    _onOptionChange(key: string, value: any, old: any, definition: any): void;
    /**
     * 获取能力状态，不存在时可用 creator 惰性创建
     *
     * @param key - 状态键，建议使用 `AbilityName:stateName` 格式避免冲突
     * @param creator - 惰性创建函数，仅在状态不存在时调用
     * @returns 状态值，或 undefined（未创建时）
     */
    abilityState<T>(key: string, creator?: () => T): T | undefined;
    /**
     * 设置能力状态
     *
     * @param key - 状态键
     * @param value - 状态值
     */
    setAbilityState<T>(key: string, value: T): void;
    /**
     * 注册清理回调，dispose 时逆序执行
     *
     * @param callback - 清理回调函数
     */
    onCleanup(callback: () => void): void;
    /** 释放前置钩子（可覆写，dispose 最先调用） */
    onBeforeDispose(): void;
    /** 释放后置钩子（可覆写，dispose 最后调用） */
    onDisposed(): void;

    /**
     * 释放资源
     *
     * 执行顺序：onBeforeDispose → onCleanup(LIFO) → 清理 abilityState → onDisposed
     */
    dispose(): void;

    /**
     * 动态属性
     */
    [key: string]: any;
}
