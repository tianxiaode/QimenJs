/**
 * RadioGroupFieldBodyComponent 单选框组字段体组件
 *
 * 作为 FormFieldComponent 的 fieldBody 子组件，
 * 使用 ItemGroupStatic 管理单选选项。
 *
 * 包含节点：
 * - options  选项容器（ItemGroupStatic）
 *
 * @example
 * ```ts
 * const RadioGroupComponent = FormFieldComponent.replace({
 *     body: { nodes: { fieldBody: { type: RadioGroupFieldBodyComponent } } },
 * });
 * ```
 */

import { Component } from '@qimenjs/component-core';

class RadioGroupFieldBodyComponent extends Component {}

export { RadioGroupFieldBodyComponent };
export type RadioGroupFieldBodyComponentInstance = InstanceType<
    typeof RadioGroupFieldBodyComponent
>;
