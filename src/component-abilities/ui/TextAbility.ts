/**
 * TextAbility 文本能力
 *
 * 提供组件文本内容的动态管理，支持多文本（通过 texts 数组声明）。
 * 内部使用 createContentManager 管理文本元素，自动生成闭包方法。
 *
 * 组件通过 static texts 声明文本列表，支持三种形式：
 * - 字符串：`static texts = ['default']` → 无 order
 * - 元组：`static texts = [['default', 20]]` → 带 order
 * - 对象：`static texts = [{ name: 'default', order: 20 }]` → 完整
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
 * btn.setText('新建');
 * btn.text = '新建';
 * ```
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { createContentManager, normalizeContentDecls, extractContentMeta } from '../content';
import type { ContentItemDecl } from '../content';

export const TextAbility: AbilityDefinition = {
    /**
     * 纯文本内容（兼容旧模式）
     */
    text: {
        get(): string {
            const rawTexts: ContentItemDecl[] = (this.constructor as any).texts || [];
            if (rawTexts.length > 0) {
                const idMap = this.abilityState('ContentManager:text:idMap') as Record<string, string>;
                if (idMap?.default) {
                    const el = document.getElementById(idMap.default);
                    return el?.textContent || '';
                }
                return '';
            }
            return this.abilityState('TextAbility:text', () => '');
        },
        set(value: string): void {
            const rawTexts: ContentItemDecl[] = (this.constructor as any).texts || [];
            if (rawTexts.length > 0) {
                if (typeof this.setText === 'function') {
                    this.setText(value);
                }
                return;
            }
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
        const rawTexts: ContentItemDecl[] = (this.constructor as any).texts || [];

        if (rawTexts.length > 0) {
            const configs = normalizeContentDecls(rawTexts);
            const { names, positions } = extractContentMeta(configs);

            createContentManager(this, {
                prefix: 'text',
                names,
                mode: 'text',
                container: this.el,
                itemClass: (this.constructor as any).textItemClass,
                positions,
            });

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
