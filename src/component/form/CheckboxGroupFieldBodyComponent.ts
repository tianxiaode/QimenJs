/**
 * CheckboxGroupFieldBodyComponent 复选框组字段体组件
 *
 * 作为 FormFieldComponent 的 fieldBody 子组件，
 * 使用 ItemGroupStatic 管理复选框选项。
 *
 * 包含节点：
 * - options  选项容器（ItemGroupStatic）
 *
 * @example
 * ```ts
 * const CheckboxGroupComponent = FormFieldComponent.replace({
 *     body: { nodes: { fieldBody: { type: CheckboxGroupFieldBodyComponent } } },
 * });
 * ```
 */

import { Component } from '@qimenjs/component-core';
import type { TplNode } from '@qimenjs/component-core';
import { CHECKBOX_GROUP_FIELD_BODY_TPL } from './checkbox-group-field-body-tpl';

class CheckboxGroupFieldBodyComponent extends Component {
    get tpl(): TplNode {
        return CHECKBOX_GROUP_FIELD_BODY_TPL;
    }
}

export { CheckboxGroupFieldBodyComponent };
export type CheckboxGroupFieldBodyComponentInstance = InstanceType<
    typeof CheckboxGroupFieldBodyComponent
>;
