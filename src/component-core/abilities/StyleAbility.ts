/**
 * StyleAbility 样式管理能力
 *
 * 提供完整的样式动态管理，参考 ExtJS 的样式操作模式。
 * 支持 className/style 属性管理、AtomicCSS 按需生成、
 * 单个样式属性读写、链式调用。
 *
 * @example
 * ```js
 * // 布局定义
 * { type: ComponentTypes.BUTTON, className: 'q-btn-primary', style: { fontSize: '16px' } }
 *
 * // 运行时动态修改
 * button.addClass('active');
 * button.setStyle('color', 'red');
 * button.setStyle({ color: 'red', fontWeight: 'bold' });
 * button.removeStyle('color');
 * ```
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { AtomicCSS } from '@qimenjs/theme';

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
                const acss = AtomicCSS.getInstance();
                const resolved = acss.resolve(value);
                this.el.className = resolved;
            }
        },
    },

    /**
     * style getter/setter（对象形式）
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

    // ============================================
    // class 操作（参考 ExtJS）
    // ============================================

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
     *
     * @param name - class 名
     * @param force - 可选，true 强制添加，false 强制移除
     */
    toggleClass(name: string, force?: boolean): void {
        if (force !== undefined) {
            if (force) {
                this.addClass(name);
            } else {
                this.removeClass(name);
            }
            return;
        }
        const current = this.className || '';
        if (current.split(/\s+/).includes(name)) {
            this.removeClass(name);
        } else {
            this.addClass(name);
        }
    },

    /**
     * 检查是否包含指定 class
     */
    hasClass(name: string): boolean {
        const current = this.className || '';
        return current.split(/\s+/).includes(name);
    },

    /**
     * 替换 class
     *
     * @param oldName - 要替换的 class
     * @param newName - 新的 class
     */
    replaceClass(oldName: string, newName: string): void {
        this.removeClass(oldName);
        this.addClass(newName);
    },

    // ============================================
    // style 操作（参考 ExtJS）
    // ============================================

    /**
     * 设置样式属性
     *
     * 支持两种调用方式：
     * - setStyle(prop, value) - 设置单个属性
     * - setStyle({ prop1: val1, prop2: val2 }) - 批量设置
     *
     * @returns 组件自身，支持链式调用
     */
    setStyle(propOrProps: string | Record<string, string>, value?: string): any {
        if (!this.el) return this;

        if (typeof propOrProps === 'object') {
            // 批量设置
            for (const [p, v] of Object.entries(propOrProps)) {
                (this.el.style as any)[p] = v;
            }
        } else {
            // 单个设置
            (this.el.style as any)[propOrProps] = value;
        }

        return this;
    },

    /**
     * 获取单个样式属性值
     *
     * @param prop - CSS 属性名（驼峰式）
     * @returns 属性值
     */
    getStyle(prop: string): string {
        if (!this.el) return '';
        return (this.el.style as any)[prop] || '';
    },

    /**
     * 移除样式属性
     *
     * @param prop - CSS 属性名（驼峰式）
     */
    removeStyle(prop: string): void {
        if (this.el) {
            (this.el.style as any)[prop] = '';
        }
    },

    /**
     * 设置 DOM 属性
     *
     * @param attr - 属性名
     * @param value - 属性值
     */
    setAttribute(attr: string, value: string): void {
        if (this.el) {
            this.el.setAttribute(attr, value);
        }
    },

    /**
     * 获取 DOM 属性
     *
     * @param attr - 属性名
     * @returns 属性值
     */
    getAttribute(attr: string): string | null {
        if (!this.el) return null;
        return this.el.getAttribute(attr);
    },

    /**
     * 移除 DOM 属性
     */
    removeAttribute(attr: string): void {
        if (this.el) {
            this.el.removeAttribute(attr);
        }
    },

    /**
     * 从 props 初始化样式（由 ComponentBase.applyOverrides 调用）
     */
    __initProps(props: Record<string, any>): void {
        if (props.className) {
            this.className = props.className;
        }
        if (props.style) {
            if (typeof props.style === 'string') {
                // 字符串形式的 style，解析为对象
                try {
                    const styleObj: Record<string, string> = {};
                    props.style.split(';').forEach((s: string) => {
                        const [key, val] = s.split(':').map((x: string) => x.trim());
                        if (key && val) {
                            // 将 kebab-case 转为 camelCase
                            const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                            styleObj[camelKey] = val;
                        }
                    });
                    this.style = styleObj;
                } catch (e) {
                    // 解析失败，忽略
                }
            } else if (typeof props.style === 'object') {
                this.style = props.style;
            }
        }
    },
};
