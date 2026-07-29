/**
 * TextComponent 文本组件
 *
 * 轻量文本封装，支持内容、样式类、语义角色。
 * 适用于 ItemGroup 中的文本项（error/help/label 等）。
 *
 * 通过 CommonPropsAbility 操控 root 和 content 节点，
 * 不直接操作 nodeMap。
 *
 * @example
 * ```ts
 * new TextComponent({ text: '用户名已存在', cls: 'q-input__error' })
 * itemGroup.add({ type: 'Text', text: '请输入3-20个字符', cls: 'q-input__help' })
 * ```
 */

import { Component } from '@qimenjs/component-core';

export interface TextProps {
    text?: string;
    tag?: string;
    cls?: string;
    role?: string;
}

class TextComponent extends Component {
    onAfterInit(props?: TextProps): void {
        this.update(props);
    }

    update(props?: Partial<TextProps>): void {
        if (props?.text !== undefined) this.text = props.text;
        if (props?.cls !== undefined) this.cls = props.cls;
        if (props?.role !== undefined) this.role = props.role;
        if (props?.tag !== undefined) this.tag = props.tag;
    }

    get text(): string {
        return this.nodeMap?.content?.el?.textContent ?? '';
    }
    set text(v: string) {
        this.setNodeProp('text', v, 'content');
    }

    get tag(): string {
        return this.nodeMap?.content?.el?.tagName?.toLowerCase() ?? 'span';
    }
    set tag(v: string) {
        const el = this.nodeMap?.content?.el as HTMLElement | null;
        if (!el?.parentElement) return;
        const newEl = document.createElement(v);
        newEl.className = el.className;
        newEl.textContent = el.textContent;
        for (const attr of Array.from(el.attributes)) {
            if (attr.name !== 'class') newEl.setAttribute(attr.name, attr.value);
        }
        el.replaceWith(newEl);
        this.nodeMap.content.el = newEl;
    }
}

export { TextComponent };
export type TextComponentInstance = InstanceType<typeof TextComponent>;
