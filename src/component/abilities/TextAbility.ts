/**
 * TextAbility 文本能力
 *
 * 提供组件文本内容的动态管理，参考 ExtJS 的 text/html 配置模式。
 * 支持 text（纯文本）和 html（富文本）两种模式，互斥使用。
 *
 * @example
 * ```js
 * // 布局定义
 * { type: 'Button', text: '提交' }
 * { type: 'Label', html: '<b>重要</b>' }
 *
 * // 运行时动态修改
 * button.setText('已提交');
 * label.setHtml('<span class="red">错误</span>');
 * ```
 */

import type { AbilityDefinition } from '@qimenjs/composable';

export const TextAbility: AbilityDefinition = {
    /**
     * 纯文本内容
     *
     * 设置时自动更新 DOM（使用 textContent，安全无 XSS）
     */
    text: {
        get(): string {
            return this.abilityState('TextAbility:text', () => '');
        },
        set(value: string): void {
            this.setAbilityState('TextAbility:text', value);
            // 清除 html 模式
            this.setAbilityState('TextAbility:html', undefined);
            this.updateText();
        },
    },

    /**
     * 富文本内容
     *
     * 设置时自动更新 DOM（使用 innerHTML，注意 XSS 风险）
     */
    html: {
        get(): string {
            return this.abilityState('TextAbility:html', () => '');
        },
        set(value: string): void {
            this.setAbilityState('TextAbility:html', value);
            // 清除 text 模式
            this.setAbilityState('TextAbility:text', undefined);
            this.updateText();
        },
    },

    /**
     * 设置纯文本（链式调用）
     *
     * @param text - 文本内容
     * @returns 组件自身，支持链式调用
     */
    setText(text: string): any {
        this.text = text;
        return this;
    },

    /**
     * 设置富文本（链式调用）
     *
     * @param html - HTML 内容
     * @returns 组件自身，支持链式调用
     */
    setHtml(html: string): any {
        this.html = html;
        return this;
    },

    /**
     * 更新 DOM 中的文本内容
     *
     * 查找 [data-ref="text"] 元素，找不到则直接操作 el
     */
    updateText(): void {
        if (!this.el) return;

        const html = this.abilityState('TextAbility:html', () => undefined);
        const text = this.abilityState('TextAbility:text', () => '');

        // 优先查找 text 容器
        const textEl = this.el.querySelector('[data-ref="text"]') as HTMLElement || this.el;

        if (html) {
            textEl.innerHTML = html;
        } else {
            textEl.textContent = text;
        }

        this.markDirty();
    },

    /**
     * 从 props 初始化文本（由 ComponentBase.applyOverrides 调用）
     */
    __initProps(props: Record<string, any>): void {
        if (props.text !== undefined) {
            this.text = props.text;
        } else if (props.html !== undefined) {
            this.html = props.html;
        }
    },
};
