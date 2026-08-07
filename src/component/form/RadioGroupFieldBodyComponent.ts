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
import type { TplNode } from '@qimenjs/component-core';
import { RADIO_GROUP_FIELD_BODY_TPL } from './radio-group-field-body-tpl';

class RadioGroupFieldBodyComponent extends Component {
    get tpl(): TplNode {
        return RADIO_GROUP_FIELD_BODY_TPL;
    }
}

export { RadioGroupFieldBodyComponent };
export type RadioGroupFieldBodyComponentInstance = InstanceType<
    typeof RadioGroupFieldBodyComponent
>;
