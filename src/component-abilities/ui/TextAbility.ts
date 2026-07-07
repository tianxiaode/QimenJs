/**
 * TextAbility 文本能力
 *
 * 提供组件文本内容的动态管理，支持多文本（通过 names 数组声明）。
 * 内部使用 createContentManager 管理文本元素，自动生成闭包方法。
 *
 * 组件通过 static texts 声明文本名称列表：
 * - 单文本：`static texts = ['default']` → 生成 setText / getText / text 属性
 * - 多文本：`static texts = ['title', 'subtitle']` → 生成 setTitleText / setSubtitleText
 *
 * 兼容旧模式：如果组件没有声明 texts，回退到 data-ref="text" 模式。
 *
 * @example
 * ```typescript
 * // 按钮组件
 * class ButtonComponent extends ComponentBase {
 *     static abilities = [IconAbility, TextAbility, ClickAbility];
 *     static texts = ['default'];
 * }
 *
 * // 使用
 * btn.setText('新建');            // 单文本简化方法
 * btn.text = '新建';             // 属性方式
 * ```
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { createContentManager } from '../content';

export const TextAbility: AbilityDefinition = {
    /**
     * 纯文本内容（兼容旧模式）
     *
     * 如果组件声明了 texts，由 createContentManager 管理。
     * 如果没有声明，回退到 data-ref="text" 模式。
     */
    text: {
        get(): string {
            const names: string[] = (this.constructor as any).texts || [];
            if (names.length > 0) {
                // ContentManager 模式：从 idMap 查找
                const idMap = this.abilityState('ContentManager:text:idMap') as Record<string, string>;
                if (idMap?.default) {
                    const el = document.getElementById(idMap.default);
                    return el?.textContent || '';
                }
                return '';
            }
            // 旧模式：从 abilityState 读取
            return this.abilityState('TextAbility:text', () => '');
        },
        set(value: string): void {
            const names: string[] = (this.constructor as any).texts || [];
            if (names.length > 0) {
                // ContentManager 模式：调用生成的方法
                if (typeof this.setText === 'function') {
                    this.setText(value);
                }
                return;
            }
            // 旧模式
            this.setAbilityState('TextAbility:text', value);
            this.setAbilityState('TextAbility:html', undefined);
            this.updateText();
        },
    },

    /**
     * 富文本内容（兼容旧模式）
     */
    html: {
        get(): string {
            return this.abilityState('TextAbility:html', () => '');
        },
        set(value: string): void {
            this.setAbilityState('TextAbility:html', value);
            this.setAbilityState('TextAbility:text', undefined);
            this.updateText();
        },
    },

    /**
     * 设置纯文本（链式调用）
     */
    setText(text: string): any {
        this.text = text;
        return this;
    },

    /**
     * 设置富文本（链式调用）
     */
    setHtml(html: string): any {
        this.html = html;
        return this;
    },

    /**
     * 更新 DOM 中的文本内容（旧模式）
     *
     * 查找 [data-ref="text"] 元素，找不到则直接操作 el
     */
    updateText(): void {
        if (!this.el) return;

        const html = this.abilityState('TextAbility:html', () => undefined);
        const text = this.abilityState('TextAbility:text', () => '');

        const textEl = this.el.querySelector('[data-ref="text"]') as HTMLElement || this.el;

        if (html) {
            textEl.innerHTML = html;
        } else {
            textEl.textContent = text;
        }

        this.markDirty();
    },

    /**
     * 从 props 初始化文本
     */
    __initProps(props: Record<string, any>): void {
        const names: string[] = (this.constructor as any).texts || [];

        if (names.length > 0) {
            // ContentManager 模式
            createContentManager(this, {
                prefix: 'text',
                names,
                mode: 'text',
                container: this.el,
                itemClass: (this.constructor as any).textItemClass,
            });

            // 从 props 赋值
            if (props.text !== undefined && names.includes('default')) {
                this.setText(props.text);
            }
        } else {
            // 旧模式：data-ref="text"
            if (props.text !== undefined) {
                this.text = props.text;
            } else if (props.html !== undefined) {
                this.html = props.html;
            }
        }
    },
};
