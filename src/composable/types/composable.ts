/**
 * 可组合能力系统类型定义
 */

import type { ILogger } from "@orbitjs/logger";

// ============================================
// 基础接口
// ============================================

/**
 * 可组合基类接口
 */
export interface IComposableBase {
    /**
     * 域名称（可选）
     */
    domain?: string;
    
    /**
     * 日志记录器
     */
    logger: ILogger;
    
    /**
     * 获取宿主对象自身
     */
    readonly host: any;
    
    /**
     * 获取类级缓存
     */
    getStatic<T>(key: string | symbol): T | undefined;
    
    /**
     * 设置类级缓存
     */
    setStatic<T>(key: string | symbol, value: T): void;
    
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
