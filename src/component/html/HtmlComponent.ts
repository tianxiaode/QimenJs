import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@/component-core';
import { HTML_TPL } from './html-tpl';
import { Definitions } from '@/composable';

const HtmlComponentDefs: Definitions = {
    options: {
        content: null,
    },
} as const;

class HtmlComponent extends Component {
    static type = 'html';
    get tpl(): TemplateDecl {
        return HTML_TPL;
    }

    _onContentOptionChange(value: undefined | null | string | string[]): void {
        if (Array.isArray(value) && value.length > 0) {
            value = value.join(''); // 处理数组情况
            this._setRawData('content', value); // 处理数组情况
        }
        this.setNodeHtml(value);
    }
}

HtmlComponent.define(HtmlComponentDefs);

export { HtmlComponent };
