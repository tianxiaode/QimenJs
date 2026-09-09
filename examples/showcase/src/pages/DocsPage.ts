/**
 * DocsPage - 文档页（占位）
 */

import { Component, type TemplateDecl } from '@qimenjs/component-core';

const DOCS_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-docs-page',
    style: { padding: '40px', fontFamily: 'sans-serif' },
    children: [
        { tag: 'h1', text: '文档' },
        { tag: 'p', text: '文档页面建设中...' },
    ],
};

export class DocsPage extends Component {
    get tpl(): TemplateDecl {
        return DOCS_TPL;
    }
}
