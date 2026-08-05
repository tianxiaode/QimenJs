/**
 * ButtonComponent 按钮组件
 *
 * 模板节点：
 * - icon — 图标（DOM 节点），通过 this.icon 设置内容
 * - text — 文本
 * - dropIcon — 下拉箭头图标（DOM 节点），默认隐藏
 *
 * 属性：
 * - hint — 悬停提示，设置 el.title，支持 i18n:xxx 格式
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
import { resolveI18nValue } from '@qimenjs/i18n';
import { BUTTON_TPL } from './button-tpl';

const I18N_PREFIX = 'i18n:';

/** 按钮属性接口 */
export interface ButtonProps {
    icon?: string;
    text?: string;
    hint?: string;
    size?: 'sm' | 'md' | 'lg';
}

class ButtonComponent extends Component {
    _hintKey: string = '';

    onAfterInit(props?: ButtonProps): void {
        this.initSize();
        this.update(props);
    }

    onLocaleChange(): void {
        if (this._hintKey) {
            this.el.title = resolveI18nValue(`${I18N_PREFIX}${this._hintKey}`);
        }
    }

    update(props?: Partial<ButtonProps>): void {
        if (props?.icon !== undefined) {
            this.icon = props.icon;
        }
        if (props?.text !== undefined) {
            this.text = props.text;
        }
        if (props?.hint !== undefined) {
            this._applyHint(props.hint);
        }
        this.size = props?.size || 'md';
    }

    _applyHint(hint: string): void {
        if (!hint) {
            this._hintKey = '';
            this.el.title = '';
            return;
        }
        if (hint.startsWith(I18N_PREFIX)) {
            this._hintKey = hint.slice(I18N_PREFIX.length);
            this.el.title = resolveI18nValue(hint);
        } else {
            this._hintKey = '';
            this.el.title = hint;
        }
    }
}

ButtonComponent.use(SizeAbility);
ButtonComponent.useTemplate(BUTTON_TPL);
export { ButtonComponent };
/** 按钮实例类型 */
export type ButtonComponentInstance = InstanceType<typeof ButtonComponent>;
