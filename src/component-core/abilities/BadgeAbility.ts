/**
 * BadgeAbility — 角标管理能力
 *
 * 宿主只负责：
 * - 从 ComponentRegistrar 查找 Badge 组件类
 * - 创建 Badge 实例，传入 anchor（宿主 el）和配置
 * - 在宿主上生成委托方法（setBadgeText/setBadgeVisible）
 *
 * Badge 组件自身负责：
 * - 模板渲染、绝对定位、样式
 * - setText/setVisible 等更新方法
 * - dispose 时清理所有资源
 *
 * Badge 属性通过 getBadge(key) / setBadge(key, value) 方法访问。
 */

import type { AbilityDefinition } from '@/composable';
import { ComponentRegistrar } from '../ComponentRegistrar';

/**
 * Badge 配置
 */
export interface BadgeConfig {
    /** Badge 文本内容 */
    badge?: string | number;
    /** Badge 类型：圆点/数字/文本，默认 'number' */
    badgeType?: 'dot' | 'number' | 'text';
    /** Badge 位置，默认 'top-right' */
    badgePlacement?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    /** Badge 组件类型名（对应 ComponentRegistrar 中注册的 type），默认 'Badge' */
    badgeTypeOverride?: string;
    /** 传递给 Badge 组件的额外 props */
    badgeProps?: Record<string, any>;
}

/**
 * 支持的 badge key 类型
 */
export type BadgeKey = 'badge' | 'badgeType' | 'badgePlacement' | 'badgeTypeOverride';

/**
 * badge 默认值
 */
const BADGE_DEFAULTS: Record<string, any> = {
    badgeType: 'number',
    badgePlacement: 'top-right',
    badgeTypeOverride: 'Badge',
};

export const BadgeAbility: AbilityDefinition = {
    // ─── Badge 属性访问方法 ───

    getBadge(key: BadgeKey): any {
        if (key in BADGE_DEFAULTS) {
            return this.props[key] ?? BADGE_DEFAULTS[key];
        }
        return this.props[key];
    },

    setBadge(key: BadgeKey, value: any): void {
        this.setProp(key, value);
    },

    /**
     * 初始化 Badge — 配置驱动
     *
     * 从 ComponentRegistrar 查找 Badge 组件类，创建实例并传入 anchor 和配置。
     * Badge 组件自身负责定位、渲染、更新等全部逻辑。
     */
    initBadge(config: BadgeConfig): void {
        const badgeType = config.badgeTypeOverride ?? BADGE_DEFAULTS.badgeTypeOverride;

        // ── 1. 从 ComponentRegistrar 查找 Badge 组件类 ──

        const BadgeClass = ComponentRegistrar.getInstance().get(badgeType);
        if (!BadgeClass) return;

        // ── 2. 确定 anchor ──

        const anchor = this.el.querySelector('[data-badge-anchor]') as HTMLElement ?? this.el;

        // ── 3. 创建 Badge 组件实例 ──

        const badgeInstance = new BadgeClass({
            anchor,
            ...config.badgeProps,
            text: config.badge,
            type: config.badgeType ?? BADGE_DEFAULTS.badgeType,
            placement: config.badgePlacement ?? BADGE_DEFAULTS.badgePlacement,
        });

        const badgeEl = badgeInstance.el;
        if (!badgeEl) return;

        // ── 4. 在宿主上生成委托方法 ──

        (this as any).setBadgeText = (text: string | number) => {
            if (typeof badgeInstance.setText === 'function') {
                badgeInstance.setText(text);
            }
        };

        (this as any).setBadgeVisible = (visible: boolean) => {
            if (typeof badgeInstance.setVisible === 'function') {
                badgeInstance.setVisible(visible);
            }
        };

        // ── 5. 注册 onCleanup 清理回调 ──

        this.onCleanup(() => {
            if (typeof badgeInstance.dispose === 'function') {
                badgeInstance.dispose();
            }
            delete (this as any).setBadgeText;
            delete (this as any).setBadgeVisible;
        });
    },
};
