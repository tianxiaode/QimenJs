/**
 * TextComponent 文本组件
 *
 * 纯文本组件，用于在 JSON 定义中通过 type: "Text" 直接使用。
 * 内部直接管理 DOM，不使用 ContentAbility（文本组件无复杂交互逻辑，无需能力层）。
 *
 * @example
 * ```js
 * // JSON 定义
 * { type: 'Text', text: '标题', size: 'lg' }
 *
 * // TypeScript API
 * const text = new TextComponent({ text: '标题', size: 'lg' });
 * text.text = '新标题';
 * ```
 */

import { ComponentBase } from '@qimenjs/component-core';
import { SizeAbility } from '@qimenjs/component-abilities';

export class TextComponent extends ComponentBase {
    static readonly abilities = [SizeAbility];

    /** 根元素标签：span 而非默认的 div */
    static readonly elTag = 'span';

    private _textEl: HTMLElement;

    constructor(props?: Record<string, any>) {
        super(props);

        this.el.classList.add('q-text');

        this._textEl = document.createElement('span');
        this._textEl.className = 'q-text__content';
        this.el.appendChild(this._textEl);

        if (props?.text) this._textEl.textContent = props.text;
    }

    /** 文本内容 */
    get text(): string { return this._textEl.textContent || ''; }
    set text(value: string) { this._textEl.textContent = value; }

    update(props?: Record<string, any>): void {
        if (props?.text !== undefined) this.text = props.text;
    }
}
