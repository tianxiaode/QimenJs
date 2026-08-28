/**
 * BadgeAbility — 角标能力
 *
 * badge 不走浮动引擎，由 _initBadge 在能力初始化时创建 DOM 元素，
 * 通过 abilityState 保存 el 引用，直接追加到 this.el 末尾。
 *
 * @example
 * // 组件 options 中声明
 * badge: { text: '3', size: 'small', color: '#f00', position: 'top-right' }
 *
 * // 运行时操作
 * this.updateBadge('5');   // 更新文本
 * this.showBadge();        // 显示
 * this.hideBadge();        // 隐藏
 * this.toggleBadge();      // 切换
 */

import type { AbilityDefinition } from '@/composable';
import { BadgeOptions } from '../../types';
import { BADGE_SIZE_CONFIG, BADGE_POSITION_MAP, BADGE_STATE_KEY } from '../../constants';

/** 角标能力，提供 badge 创建、文本更新、显示/隐藏与切换 */
export const BadgeAbility: AbilityDefinition = {
    /**
     * 初始化角标
     *
     * 根据组件 badge 配置创建 DOM 元素，设置样式，
     * 通过 abilityState 保存 el 引用，追加到 this.el 末尾。
     */
    _initBadge() {
        const cfg: BadgeOptions | undefined = this.getOption('badge') as BadgeOptions | undefined;
        if (!cfg) return;

        const el = document.createElement('span');
        el.className = 'q-badge';
        el.style.position = 'absolute';
        el.textContent = String(cfg.text);

        // 尺寸
        const sizeCfg = BADGE_SIZE_CONFIG[cfg.size ?? 'medium'];
        Object.assign(el.style, sizeCfg);

        // 位置
        const posCfg = BADGE_POSITION_MAP[cfg.position ?? 'top-right'];
        Object.assign(el.style, posCfg);

        // 颜色
        if (cfg.color) {
            el.style.backgroundColor = cfg.color;
        }

        // 锚点需相对定位
        if (!this.el.style.position || this.el.style.position === 'static') {
            this.el.style.position = 'relative';
        }

        // 可见性
        if (cfg.visible === false) {
            el.style.display = 'none';
        }

        this.el.appendChild(el);

        this.abilityState(BADGE_STATE_KEY, () => el);
    },

    /**
     * 更新 badge 文本
     *
     * @param text - 新的文本内容
     *
     * @example
     * this.updateBadge('5');
     * this.updateBadge(99);
     */
    updateBadge(text: string | number): void {
        const el = this.abilityState(BADGE_STATE_KEY) as HTMLElement | undefined;
        if (el) el.textContent = String(text);
    },

    /**
     * 显示 badge
     *
     * @example
     * this.showBadge();
     */
    showBadge(): void {
        const el = this.abilityState(BADGE_STATE_KEY) as HTMLElement | undefined;
        if (el) el.style.display = '';
    },

    /**
     * 隐藏 badge
     *
     * @example
     * this.hideBadge();
     */
    hideBadge(): void {
        const el = this.abilityState(BADGE_STATE_KEY) as HTMLElement | undefined;
        if (el) el.style.display = 'none';
    },

    /**
     * 切换 badge 显示/隐藏
     *
     * @example
     * this.toggleBadge();
     */
    toggleBadge(): void {
        const el = this.abilityState(BADGE_STATE_KEY) as HTMLElement | undefined;
        if (el) {
            el.style.display = el.style.display === 'none' ? '' : 'none';
        }
    },
} as AbilityDefinition;
