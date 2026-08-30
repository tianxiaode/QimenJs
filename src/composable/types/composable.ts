/**
 * 可组合能力系统类型定义
 */

import type { ILogger } from '@qimenjs/logger';
import { TargetToOptionDefinition } from './definitions';

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
    getData(key: string): any;
    setData(key: string, value: any): void;
    setI18n(optionKey: string, value: string): void;
    get targetToMap(): Map<string, TargetToOptionDefinition>;
    get i18nOptions(): string[];
    get optionsKeys(): Set<string>;
    get propertyKeys(): Set<string>;
    _onOptionChange(
        _key: string,
        _value: any,
        _old: any,
        _definition: TargetToOptionDefinition
    ): void;
    abilityState(key: string, creator?: () => any): any | undefined;
    setAbilityState(key: string, value: any): void;
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
