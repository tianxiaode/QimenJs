/**
 * MarkdownEditorFieldBodyComponent Markdown 编辑器字段体组件
 *
 * 作为 FormFieldComponent 的 fieldBody 子组件，
 * 提供编辑区（textarea）+ 预览区（div）的双栏布局。
 *
 * 包含节点：
 * - editor     编辑区 textarea
 * - preview    预览区 div
 *
 * 模式由父组件 MarkdownEditorComponent 通过 CSS 类控制：
 * - 默认：仅编辑区
 * - q-md-editor--preview：仅预览区
 * - q-md-editor--split：编辑 + 预览双栏
 *
 * @example
 * ```ts
 * const MarkdownEditorComponent = FormFieldComponent.replace({
 *     nodes: { fieldBody: { type: MarkdownEditorFieldBodyComponent } },
 * });
 * ```
 */

import { Component } from '@qimenjs/component-core';

export let MarkdownEditorFieldBodyComponent = Component.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-md-editor__wrapper',
        children: [
            {
                tag: 'textarea',
                name: 'editor',
                cls: 'q-md-editor__input',
            },
            {
                tag: 'div',
                name: 'preview',
                cls: 'q-md-editor__preview q-md-viewer',
            },
        ],
    },
    tplEvents: {
        editor: {
            input: { emits: ['input'], debounce: 150 },
            focus: { emits: ['focus'] },
            blur: { emits: ['blur'] },
            change: { emits: ['change'], debounce: 150 },
            keydown: { emits: ['keydown'] },
        },
    },
    body: {
        type: 'MarkdownEditorFieldBody',
    },
});

export type MarkdownEditorFieldBodyComponent = InstanceType<
    typeof MarkdownEditorFieldBodyComponent
>;
