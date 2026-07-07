/**
 * StyleAbility 样式管理能力
 *
 * 提供 className 和 style 属性管理，支持 AtomicCSS 按需生成
 */

import type { AbilityDefinition } from '@qimenjs/composable';

export const StyleAbility: AbilityDefinition = {
    /**
     * className getter/setter
     *
     * 设置时调用 AtomicCSS.resolve 按需生成 CSS
     */
    className: {
        get(): string {
            return this.abilityState('StyleAbility:className', () => '');
        },
        set(value: string): void {
            this.setAbilityState('StyleAbility:className', value);

            // 调用 AtomicCSS 按需生成 CSS
            if (value && this.el) {
                try {
                    const { AtomicCSS } = require('@qimenjs/theme');
                    const acss = AtomicCSS.getInstance();
                    const resolved = acss.resolve(value);
                    this.el.className = resolved;
                } catch (e) {
                    // AtomicCSS 不可用，直接设置
                    this.el.className = value;
                }
            }
        },
    },

    /**
     * style getter/setter
     *
     * 设置时更新 el.style
     */
    style: {
        get(): Record<string, string> | undefined {
            return this.abilityState('StyleAbility:style', () => undefined);
        },
        set(value: Record<string, string>): void {
            this.setAbilityState('StyleAbility:style', value);

            if (value && this.el) {
                for (const [prop, val] of Object.entries(value)) {
                    (this.el.style as any)[prop] = val;
                }
            }
        },
    },

    /**
     * 添加 class
     */
    addClass(name: string): void {
        const current = this.className || '';
        if (!current.split(/\s+/).includes(name)) {
            this.className = current ? `${current} ${name}` : name;
        }
    },

    /**
     * 移除 class
     */
    removeClass(name: string): void {
        const current = this.className || '';
        const names = current.split(/\s+/).filter((n: string) => n !== name);
        this.className = names.join(' ');
    },

    /**
     * 切换 class
     */
    toggleClass(name: string): void {
        const current = this.className || '';
        if (current.split(/\s+/).includes(name)) {
            this.removeClass(name);
        } else {
            this.addClass(name);
        }
    },

    /**
     * 初始化样式
     *
     * 从 props 读取 className 和 style 并应用
     */
    __init__: '_initStyle',

    _initStyle(): void {
        if (this.props?.className) {
            this.className = this.props.className;
        }
        if (this.props?.style) {
            this.style = this.props.style;
        }
    },
};
