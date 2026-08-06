/**
 * ButtonComponent 按钮组件
 *
 * 模板节点：
 * - icon — 图标（DOM 节点），通过 this.icon 设置内容
 * - text — 文本
 * - dropIcon — 下拉箭头图标（DOM 节点），默认隐藏
 *
 * 属性（由 applyConfig 自动应用，i18n 由框架自动刷新）：
 * - hint — 悬停提示，设置 el.title，支持 i18n:xxx 格式（框架自动处理）
 * - icon — 图标内容
 * - text — 按钮文字
 * - size — 尺寸 sm/md/lg
 *
 * 事件：
 * - click — 按钮（icon/text）点击时触发
 *
 * 浮动层快捷方式（由 Component 基类 floats 提供）：
 * - badge: { text: '5' } → 自动挂载 Badge 浮层（trigger='always'）
 * - tooltip: '提示文本' → 自动挂载 Tooltip 浮层（trigger='hover'）
 * - badge: null / tooltip: null → 不触发浮层
 *
 * 派生组件（如 DropdownComponent）通过 popover 属性声明弹出浮层。
 *
 * 尺寸：
 * - 支持 sm/md/lg 三档尺寸，由 SizeAbility 提供
 * - 默认尺寸为 md
 */

import { Component } from '@qimenjs/component-core';
import { SizeAbility } from '@qimenjs/component-abilities';
import { BUTTON_TPL } from './button-tpl';

/** 按钮属性接口 */
export interface ButtonProps {
    icon?: string;
    text?: string;
    hint?: string;
    size?: 'sm' | 'md' | 'lg';
}

class ButtonComponent extends Component {
    onAfterInit(): void {
        this.initSize();
        const { icon, text, size } = this._rawProps;
        if (icon !== undefined) this.icon = icon;
        if (text !== undefined) this.text = text;
        this.size = size || 'md';
    }

    update(props?: Partial<ButtonProps>): void {
        if (props?.icon !== undefined) this.icon = props.icon;
        if (props?.text !== undefined) this.text = props.text;
        if (props?.hint !== undefined) this.hint = props.hint;
        if (props?.size !== undefined) this.size = props.size;
    }
}

ButtonComponent.use(SizeAbility);
ButtonComponent.useTemplate(BUTTON_TPL);
export { ButtonComponent };
/** 按钮实例类型 */
export type ButtonComponentInstance = InstanceType<typeof ButtonComponent>;
