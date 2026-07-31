/**
 * InputFieldBodyComponent 输入框字段体组件
 *
 * 作为 FormFieldComponent 的 fieldBody 子组件，
 * el 直接充当 wrapper 层（q-input__wrapper），避免多套一层 div。
 *
 * 包含节点：
 * - prefix        前缀区域
 * - field         输入框
 * - actions       操作按钮区域（ItemGroupStatic）
 * - suffix        右侧装饰区域
 * - dropdownIcon  下拉箭头图标区域
 *
 * @example
 * ```ts
 * // 通过 FormFieldComponent.replace() 的 body.nodes 使用：
 * const InputComponent = FormFieldComponent.replace({
 *     body: { nodes: { fieldBody: { type: 'InputFieldBody' } } },
 * });
 * ```
 */

import { Component } from '@qimenjs/component-core';
import { INPUT_FIELD_BODY_TPL } from './input-field-body-tpl';

class InputFieldBodyComponent extends Component {}

InputFieldBodyComponent.useTemplate(INPUT_FIELD_BODY_TPL);
export { InputFieldBodyComponent };
export type InputFieldBodyComponentInstance = InstanceType<typeof InputFieldBodyComponent>;
