/**
 * LabelComponent 标签组件
 *
 * 独立轻量标签，支持文本、必填标记、语义角色。
 * 适用于非表单场景（表格列头、列表项标签等）。
 * FormFieldComponent 内部 label 不受影响，两套各自独立。
 *
 * 模板节点：
 * - content — 标签文本（支持 i18n）
 * - requiredMark — 必填标记（默认隐藏）
 *
 * @example
 * new LabelComponent({ text: '用户名', required: true })
 * new LabelComponent({ i18nText: 'user.name', role: 'column-header' })
 */

import { Component, CommonPropsAbility } from '@qimenjs/component-core';

export interface LabelProps {
    text?: string;
    i18nText?: string;
    required?: boolean;
    requiredMark?: string;
    requiredMarkPosition?: 'before' | 'after';
    tag?: string;
    cls?: string;
    role?: string;
}

export let LabelComponent = Component.withTemplate({
    tpl: {
        tag: 'label',
        name: 'content',
        cls: 'q-label',
        i18n: 'labelText',
        children: [
            {
                tag: 'span',
                name: 'requiredMark',
                cls: 'q-label__required-mark',
                hidden: true,
            },
        ],
    },
    body: {
        type: 'Label',

        onInitState() {
            return {
                _required: false,
                _requiredMark: '*',
                _requiredMarkPosition: 'after' as 'before' | 'after',
            };
        },

        onAfterInit(props?: LabelProps): void {
            this._initLabel(props);
        },

        _initLabel(props?: LabelProps): void {
            if (props?.i18nText) {
                this.text = props.i18nText;
            } else if (props?.text) {
                this.text = props.text;
            }
            if (props?.requiredMark) this._requiredMark = props.requiredMark;
            if (props?.requiredMarkPosition)
                this._requiredMarkPosition = props.requiredMarkPosition;
            if (props?.required) {
                this._required = true;
                this._applyRequiredMark();
                this.setNodeHidden(false, 'requiredMark');
            }
            if (props?.tag) this.tag = props.tag;
            if (props?.cls) this.addCls(props.cls);
            if (props?.role) this.role = props.role;
        },

        _applyRequiredMark(): void {
            const markEl = this.nodeMap?.requiredMark?.el as HTMLElement | null;
            if (!markEl) return;
            markEl.textContent = this._requiredMark;
            markEl.classList.toggle(
                'q-label__required-mark--before',
                this._requiredMarkPosition === 'before'
            );
            markEl.classList.toggle(
                'q-label__required-mark--after',
                this._requiredMarkPosition === 'after'
            );
        },

        get text(): string {
            const contentEl = this.nodeMap?.content?.el as HTMLElement | null;
            if (!contentEl) return '';
            const markEl = this.nodeMap?.requiredMark?.el as HTMLElement | null;
            if (!markEl) return contentEl.textContent ?? '';
            return contentEl.textContent?.replace(markEl.textContent ?? '', '') ?? '';
        },
        set text(v: string) {
            this.setNodeProp('text', v, 'content');
        },

        get tag(): string {
            return this.nodeMap?.content?.el?.tagName?.toLowerCase() ?? 'label';
        },
        set tag(v: string) {
            const el = this.nodeMap?.content?.el as HTMLElement | null;
            if (!el?.parentElement) return;
            const newEl = document.createElement(v);
            newEl.className = el.className;
            for (const attr of Array.from(el.attributes)) {
                if (attr.name !== 'class') newEl.setAttribute(attr.name, attr.value);
            }
            while (el.firstChild) newEl.appendChild(el.firstChild);
            el.replaceWith(newEl);
            this.nodeMap.content.el = newEl;
        },

        get role(): string {
            return this.nodeMap?.content?.el?.getAttribute('role') ?? '';
        },
        set role(v: string) {
            if (v) {
                this.setAttr('role', v);
            } else {
                const el = this.nodeMap?.content?.el as HTMLElement | null;
                el?.removeAttribute('role');
            }
        },

        get required(): boolean {
            return this._required;
        },
        set required(v: boolean) {
            this._required = v;
            this.setNodeHidden(!v, 'requiredMark');
            if (v) this._applyRequiredMark();
        },

        update(props?: Partial<LabelProps>): void {
            if (props?.i18nText !== undefined) this.text = props.i18nText;
            else if (props?.text !== undefined) this.text = props.text;
            if (props?.required !== undefined) this.required = props.required;
            if (props?.requiredMark !== undefined) {
                this._requiredMark = props.requiredMark;
                this._applyRequiredMark();
            }
            if (props?.requiredMarkPosition !== undefined) {
                this._requiredMarkPosition = props.requiredMarkPosition;
                this._applyRequiredMark();
            }
            if (props?.tag !== undefined) this.tag = props.tag;
            if (props?.cls !== undefined) this.addCls(props.cls);
            if (props?.role !== undefined) this.role = props.role;
        },
    },
}).with([CommonPropsAbility]);

export type LabelComponent = InstanceType<typeof LabelComponent>;
