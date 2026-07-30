/**
 * FloatAbility — 浮层动态管理能力
 *
 * 为组件提供浮层的结构变更与数据更新方法：
 *
 * 结构变更（通过 floats setter 驱动）：
 * - attachFloat(key, decl)  — 动态挂载浮层
 * - detachFloat(key)        — 动态卸载浮层
 *
 * 控制操作（manual trigger 时手动开关）：
 * - showFloat(key)          — 显示浮层
 * - hideFloat(key)          — 隐藏浮层
 * - toggleFloat(key)        — 切换浮层
 *
 * 数据更新（不重建组件实例，仅发送 CHANGE 事件）：
 * - updateFloat(key, data)  — 通用数据更新
 * - updateBadge(data)       — Badge 浮层快捷更新
 * - updateTooltip(data)     — Tooltip 浮层快捷更新
 *
 * 与 floats setter 的关系：
 * - setter 管结构：有没有、长什么样（anchor/trigger/placement 等）
 * - updateFloat 管数据：显示什么内容（text/visible/tooltip 等）
 * - 两者不混用
 */

import type { AbilityDefinition } from '@/composable';
import type { FloatDecl } from '../types/tpl-node-types';
import { EventContextBuilder } from '@/context';
import { OVERLAY_ACTIONS } from '@/events/overlay-events';

export const FloatAbility: AbilityDefinition = {
    /**
     * 动态挂载浮层
     *
     * 运行时向 floats 追加一个浮层定义，触发 setter 驱动。
     * 初始化阶段（_initializing=true）仅缓存，不驱动。
     *
     * @param key - 浮层 key（如 'dropBtn'、'subNav'）
     * @param decl - 浮层定义
     *
     * @example
     * this.attachFloat('subNav', { type: 'Menu', anchor: 'self', trigger: 'manual' });
     */
    attachFloat(key: string, decl: FloatDecl): void {
        const current = this._floatsCache ?? {};
        this.floats = { ...current, [key]: decl };
    },

    /**
     * 动态卸载浮层
     *
     * 从 floats 中移除指定 key，触发 setter 驱动。
     *
     * @param key - 要卸载的浮层 key
     *
     * @example
     * this.detachFloat('subNav');
     */
    detachFloat(key: string): void {
        const current = this._floatsCache;
        if (!current || !(key in current)) return;
        const next = { ...current };
        delete next[key];
        this.floats = Object.keys(next).length > 0 ? next : undefined;
    },

    /**
     * 显示浮层（manual trigger 时手动调用）
     *
     * @param key - 浮层 key
     *
     * @example
     * this.showFloat('subNav');
     */
    showFloat(key: string): void {
        const overlayKey = `${this.id}:${key}`;
        this.overlayEmit(
            EventContextBuilder.create()
                .withEvent(`overlay:${overlayKey}:${OVERLAY_ACTIONS.SHOW}`)
                .withType(OVERLAY_ACTIONS.SHOW)
                .withSource(overlayKey)
                .withData({ component: this })
                .build()
        );
    },

    /**
     * 隐藏浮层
     *
     * @param key - 浮层 key
     *
     * @example
     * this.hideFloat('subNav');
     */
    hideFloat(key: string): void {
        const overlayKey = `${this.id}:${key}`;
        this.overlayEmit(
            EventContextBuilder.create()
                .withEvent(`overlay:${overlayKey}:${OVERLAY_ACTIONS.HIDE}`)
                .withType(OVERLAY_ACTIONS.HIDE)
                .withSource(overlayKey)
                .withData({ component: this })
                .build()
        );
    },

    /**
     * 切换浮层显示/隐藏
     *
     * @param key - 浮层 key
     *
     * @example
     * this.toggleFloat('dropBtn');
     */
    toggleFloat(key: string): void {
        const overlayKey = `${this.id}:${key}`;
        this.overlayEmit(
            EventContextBuilder.create()
                .withEvent(`overlay:${overlayKey}:${OVERLAY_ACTIONS.TOGGLE}`)
                .withType(OVERLAY_ACTIONS.TOGGLE)
                .withSource(overlayKey)
                .withData({ component: this })
                .build()
        );
    },

    /**
     * 更新浮层数据（不重建组件实例）
     *
     * 发送 CHANGE 事件，由浮层组件的 onOverlayChange 处理。
     * 与 setter 分离：setter 管结构变更，updateFloat 管数据更新。
     *
     * @param key - 浮层 key
     * @param data - 更新数据
     *
     * @example
     * this.updateFloat('badge', { text: '5' });
     */
    updateFloat(key: string, data: Record<string, any>): void {
        const overlayKey = `${this.id}:${key}`;
        this.overlayEmit(
            EventContextBuilder.create()
                .withEvent(`overlay:${overlayKey}:${OVERLAY_ACTIONS.CHANGE}`)
                .withType(OVERLAY_ACTIONS.CHANGE)
                .withSource(overlayKey)
                .withData({ component: { id: this.id }, data })
                .build()
        );
    },

    /**
     * 更新 Badge 浮层数据
     *
     * @param data - 更新数据（如 { text: '5', visible: true }）
     *
     * @example
     * this.updateBadge({ text: '5' });
     * this.updateBadge({ visible: false });
     */
    updateBadge(data: Record<string, any>): void {
        this.updateFloat('badge', data);
    },

    /**
     * 更新 Tooltip 浮层数据
     *
     * @param data - 更新数据（如 { tooltip: '提示文本' }）
     *
     * @example
     * this.updateTooltip({ tooltip: '新提示' });
     * this.updateTooltip({ visible: false });
     */
    updateTooltip(data: Record<string, any>): void {
        this.updateFloat('tooltip', data);
    },
};
