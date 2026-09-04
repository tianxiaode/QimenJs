import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@/component-core';
import { TEXT_TPL } from './text-tpl';
import { Definitions } from '@/composable';
import './text.css';

const TextComponentDefs: Definitions = {
    targetToOptions: {
        text: { target: 'root', to: 'text' },
    },
    options: {
        tag: null,
    },
} as const;

class TextComponent extends Component {
    static type = 'text';
    get tpl(): TemplateDecl {
        return TEXT_TPL;
    }

    _onTagOptionChange(value: string) {
        if (!value) return;
        const oldEl = this.getNodeEl('root');
        if (!oldEl) return;
        const newEl = document.createElement(value);
        newEl.className = oldEl.className;
        newEl.textContent = oldEl.textContent;
        for (let i = 0; i < oldEl.attributes.length; i++) {
            const attr = oldEl.attributes[i];
            if (attr && attr.name !== 'class') newEl.setAttribute(attr.name, attr.value);
        }
        oldEl.replaceWith(newEl);
        this._setNodeEl('root', newEl);
        this.el = newEl;
    }
}

TextComponent.define(TextComponentDefs);

export { TextComponent };
export type TextComponentInstance = InstanceType<typeof TextComponent>;
