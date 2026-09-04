/**
 * LabelComponent 标签组件
 *
 * 独立轻量标签，支持文本、必填标记、语义角色。
 * 适用于非表单场景（表格列头、列表项标签等）。
 *
 * 模板节点：
 * - content      — 标签文本（根元素，默认 <label>）
 * - requiredMark — 必填标记（默认隐藏）
 *
 * @example
 * new LabelComponent({ text: '用户名', required: true })
 * new LabelComponent({ text: '列名', role: 'column-header' })
 */

import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@/component-core';
import { LABEL_TPL } from './label-tpl';
import { Definitions } from '@/composable';
import './label.css';

/** 标签属性接口 */
export interface LabelProps {
    text?: string;
    required?: boolean;
    requiredMark?: string;
    requiredMarkPosition?: 'before' | 'after';
    tag?: string;
    role?: string;
}

const LabelComponentDefs: Definitions = {
    options: {
        text: null,
        required: false,
        requiredMark: '*',
        requiredMarkPosition: 'after',
        tag: 'label',
        role: null,
    },
} as const;

class LabelComponent extends Component {
    static type = 'label';
    get tpl(): TemplateDecl {
        return LABEL_TPL;
    }

    _onTextOptionChange(value: string): void {
        const el = this.getNodeEl('content');
        if (el) el.textContent = value ?? '';
    }

    _onRequiredOptionChange(value: boolean): void {
        this._setNodeHidden(!value, 'requiredMark');
        if (value) this._applyRequiredMark();
    }

    _onRequiredMarkOptionChange(value: string): void {
        this._applyRequiredMark();
    }

    _onRequiredMarkPositionOptionChange(value: 'before' | 'after', old: 'before' | 'after'): void {
        this.toggleCls('q-label__required-mark--before', value === 'before', 'requiredMark');
        this.toggleCls('q-label__required-mark--after', value === 'after', 'requiredMark');
    }

    _onRoleOptionChange(value: string): void {
        if (value) {
            this.setAttributes({ role: value });
        } else {
            this.removeAttributes(['role']);
        }
    }

    _onTagOptionChange(value: string): void {
        const oldEl = this.getNodeEl('content');
        if (!oldEl?.parentElement) return;
        const newEl = document.createElement(value);
        newEl.className = oldEl.className;
        for (const attr of Array.from(oldEl.attributes) as Attr[]) {
            if (attr.name !== 'class') newEl.setAttribute(attr.name, attr.value);
        }
        while (oldEl.firstChild) newEl.appendChild(oldEl.firstChild);
        oldEl.replaceWith(newEl);
        this._setNodeEl('content', newEl);
    }

    _applyRequiredMark(): void {
        const markEl = this.getNodeEl('requiredMark');
        if (markEl) markEl.textContent = this.requiredMark;
        this.toggleCls(
            'q-label__required-mark--before',
            this.requiredMarkPosition === 'before',
            'requiredMark'
        );
        this.toggleCls(
            'q-label__required-mark--after',
            this.requiredMarkPosition === 'after',
            'requiredMark'
        );
    }

    onAfterInit(): void {
        this._onRequiredMarkPositionOptionChange(this.requiredMarkPosition, 'after');
        if (this.required) this._applyRequiredMark();
    }
}

LabelComponent.define(LabelComponentDefs);
export { LabelComponent };
/** 标签实例类型 */
export type LabelComponentInstance = InstanceType<typeof LabelComponent>;