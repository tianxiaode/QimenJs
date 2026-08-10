/**
 * FloatAbility — 浮层管理能力（薄 facade）
 *
 * 核心逻辑委托给 FloatEngine 单例（engine/FloatEngine.ts），
 * 本文件只定义 AbilityDefinition 的接口，所有方法都是薄委托。
 *
 * 类型处理器（tooltip/dialog）在 FloatEngine 中注册，
 * 新增类型只需 registerHandler，不需改 FloatAbility。
 *
 * @see FloatEngine for core implementation
 */

import type { AbilityDefinition } from '@/composable';
import type { FloatDecl } from '../types/tpl';
import { FloatEngine } from '../engine/FloatEngine';

const engine = FloatEngine.getInstance();

/** 浮层管理能力，委托 FloatEngine 实现 tooltip/dialog/loading 等浮层控制 */
export const FloatAbility: AbilityDefinition = {
    // ══════════════════════════════════════════════════════════════
    // 缓存管理
    // ══════════════════════════════════════════════════════════════

    get floats(): Record<string, FloatDecl> | undefined {
        return engine.getFloats(this);
    },

    set floats(val: Record<string, FloatDecl> | undefined) {
        engine.setFloats(this, val);
    },

    // ══════════════════════════════════════════════════════════════
    // 初始化 & 提交
    // ══════════════════════════════════════════════════════════════

    _initFloatsFromProps(): void {
        const result = engine.buildFromProps(this);
        if (Object.keys(result).length > 0) {
            this.floats = result;
        }
    },

    _commitFloats(): void {
        engine.commitFloats(this);
    },

    // ══════════════════════════════════════════════════════════════
    // 结构变更方法
    // ══════════════════════════════════════════════════════════════

    attachFloat(key: string, decl: FloatDecl): void {
        engine.attachFloat(this, key, decl);
    },

    detachFloat(key: string): void {
        engine.detachFloat(this, key);
    },

    // ══════════════════════════════════════════════════════════════
    // 控制操作方法
    // ══════════════════════════════════════════════════════════════

    showFloat(key: string): void {
        engine.showFloat(this, key);
    },

    hideFloat(key: string): void {
        engine.hideFloat(this, key);
    },

    toggleFloat(key: string): void {
        engine.toggleFloat(this, key);
    },

    // ══════════════════════════════════════════════════════════════
    // 数据更新方法
    // ══════════════════════════════════════════════════════════════

    updateFloat(key: string, data: Record<string, any>): void {
        engine.updateFloat(this, key, data);
    },

    updateTooltip(data: Record<string, any>): void {
        engine.updateTooltip(this, data);
    },

    // ══════════════════════════════════════════════════════════════
    // Dialog 快捷方法
    // ══════════════════════════════════════════════════════════════

    showDialog(): void {
        engine.showDialog(this);
    },

    hideDialog(): void {
        engine.hideDialog(this);
    },

    toggleDialog(): void {
        engine.toggleDialog(this);
    },

    updateDialog(data: Record<string, any>): void {
        engine.updateDialog(this, data);
    },

    // ══════════════════════════════════════════════════════════════
    // Loading 快捷方法
    // ══════════════════════════════════════════════════════════════

    showLoading(text?: string, maskMode?: 'none' | 'scoped' | 'global'): void {
        engine.showLoading(this, text, maskMode);
    },

    hideLoading(): void {
        engine.hideLoading(this);
    },

    updateLoading(data: Record<string, any>): void {
        engine.updateLoading(this, data);
    },
};
