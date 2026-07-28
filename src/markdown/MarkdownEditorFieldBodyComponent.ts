/**
 * MarkdownEditorFieldBodyComponent Markdown 编辑器字段体组件
 *
 * 作为 FormFieldComponent 的 fieldBody 子组件，
 * 提供编辑区（textarea）+ 预览区（div）的双栏布局。
 *
 * @example
 * ```ts
 * const MarkdownEditorComponent = FormFieldComponent.replace({
 *     nodes: { fieldBody: { type: MarkdownEditorFieldBodyComponent } },
 * });
 * ```
 */

import { Component } from '@qimenjs/component-core';

class MarkdownEditorFieldBodyComponent extends Component {
    static type = 'MarkdownEditorFieldBody';

    type = 'MarkdownEditorFieldBody';
}

export { MarkdownEditorFieldBodyComponent };
export type MarkdownEditorFieldBodyComponentInstance = InstanceType<
    typeof MarkdownEditorFieldBodyComponent
>;
