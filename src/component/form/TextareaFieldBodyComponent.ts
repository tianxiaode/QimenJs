/**
 * TextareaFieldBodyComponent 多行文本字段体组件
 *
 * 作为 FormFieldComponent 的 fieldBody 子组件，
 * 使用 textarea 替代 InputFieldBody 的 input。
 *
 * 包含节点：
 * - field   文本域
 *
 * @example
 * ```ts
 * const TextareaComponent = FormFieldComponent.replace({
 *     body: { nodes: { fieldBody: { type: TextareaFieldBodyComponent } } },
 * });
 * ```
 */

import { Component } from '@qimenjs/component-core';
import { TEXTAREA_FIELD_BODY_TPL } from './textarea-field-body-tpl';

class TextareaFieldBodyComponent extends Component {}

TextareaFieldBodyComponent.useTemplate(TEXTAREA_FIELD_BODY_TPL);
export { TextareaFieldBodyComponent };
export type TextareaFieldBodyComponentInstance = InstanceType<typeof TextareaFieldBodyComponent>;
