/**
 * DragAbility — 拖拽动态管理能力（薄 facade）
 *
 * 核心逻辑委托给 DragEngine 单例（engine/DragEngine.ts），
 * 本文件只定义 AbilityDefinition 的接口，所有方法都是薄委托。
 *
 * 两种使用场景：
 *   1. Self-Drag（自身拖动）— 如 Dialog 窗口拖动
 *   2. Drag & Drop（拖放交互）— 如卡片拖入容器
 *
 * @see DragEngine for core implementation
 */

import type { AbilityDefinition } from '@/composable';
import type { DragDecl, DropDecl } from '../';
import { DragEngine } from '../engine/DragEngine';

const engine = DragEngine.getInstance();

/** 拖拽动态管理能力，委托 DragEngine 实现自身拖动与拖放交互 */
export const DragAbility: AbilityDefinition = {
    // ══════════════════════════════════════════════════════════════
    // 拖拽声明 — getter/setter 委托给引擎
    // ══════════════════════════════════════════════════════════════

    get drags(): Record<string, DragDecl> | undefined {
        return engine.getDrags(this);
    },

    set drags(val: Record<string, DragDecl> | undefined) {
        engine.setDrags(this, val);
    },

    // ══════════════════════════════════════════════════════════════
    // 拖拽提交
    // ══════════════════════════════════════════════════════════════

    _commitDrags(): void {
        engine.commitDrags(this);
    },

    // ══════════════════════════════════════════════════════════════
    // 放置区提交
    // ══════════════════════════════════════════════════════════════

    _commitDrops(): void {
        engine.commitDrops(this);
    },

    // ══════════════════════════════════════════════════════════════
    // 结构变更方法
    // ══════════════════════════════════════════════════════════════

    attachDrag(key: string, decl: DragDecl): void {
        engine.attachDrag(this, key, decl);
    },

    detachDrag(key: string): void {
        engine.detachDrag(this, key);
    },

    attachDropZone(key: string, decl: DropDecl = {}): void {
        engine.attachDropZone(this, key, decl);
    },

    detachDropZone(key: string): void {
        engine.detachDropZone(this, key);
    },

    // ══════════════════════════════════════════════════════════════
    // 拖拽会话控制
    // ══════════════════════════════════════════════════════════════

    startDrag(key: string): void {
        engine.startDrag(this, key);
    },

    stopDrag(key: string): void {
        engine.stopDrag(this, key);
    },

    // ══════════════════════════════════════════════════════════════
    // 便捷开关
    // ══════════════════════════════════════════════════════════════

    setDraggable(enabled: boolean, config?: DragDecl): void {
        engine.setDraggable(this, enabled, config);
    },

    setDropZone(enabled: boolean, config?: DropDecl): void {
        engine.setDropZone(this, enabled, config);
    },
};
