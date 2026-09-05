/**
 * ButtonComponent 按钮组件
 *
 * 模板节点：
 * - icon — 图标（DOM 节点），通过 this.icon 设置内容
 * - text — 文本
 * - dropIcon — 下拉箭头图标（DOM 节点），默认隐藏
 *
 * 属性（由 applyConfig 自动应用，i18n 由框架自动刷新）：
 * - hint — 悬停提示，设置 el.title，支持 @xxx 格式（框架自动处理）
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
import type { TemplateDecl } from '@/component-core';
import { BUTTON_TPL } from './button-tpl';
import { Definitions } from '@/composable';
import { SizeAbility } from '@/component-abilities';
import './button.css';

const ButtonComponentDefs: Definitions = {
    options: {
        text: null,
        size: 'md', // 默认尺寸,
        ghost: false, // 无边框
        iconAlign: 'left', // 布局
        color: 'default', // 按钮类型
        iconCls: null, // 图标内容
        busy: false, // 加载状态
    },
} as const;

class ButtonComponent extends Component {
    static type = 'button';
    get tpl(): TemplateDecl {
        return BUTTON_TPL;
    }

    _onTextOptionChange(value: string, _old: string) {
        this._setNodeText('text', value);
        const nodeName = 'text';
        value
            ? this.addCls('q-button__text', nodeName)
            : this.removeCls('q-button__text', nodeName);
    }

    _onIconClsOptionChange(value: string, old: string) {
        const nodeName = 'icon';
        value
            ? this.addCls('q-button__icon', nodeName)
            : this.removeCls('q-button__icon', nodeName);
        if (old) this.removeCls(old, nodeName);
        if (value) this.addCls(value, nodeName);
    }

    _onColorOptionChange(value: string, old: string) {
        this._toggleOptionCls('q-button--', value, old);
    }

    _onGhostOptionChange(value: boolean) {
        value ? this.addCls('q-button--ghost') : this.removeCls('q-button--ghost');
    }

    _onIconAlignOptionChange(value: string, old: string) {
        this._toggleOptionCls('q-button-layout--icon-', value, old, 'content');
    }

    _onBusyOptionChange(value: boolean) {
        const iconNode = 'icon';
        const loadingNode = 'loading';
        if (value) {
            this.addCls('q-button--loading');
            this.addCls('hidden', iconNode);
            this.removeCls('hidden', loadingNode);
            this.disable = true;
        } else {
            this.removeCls('q-button--loading');
            this.removeCls('hidden', iconNode);
            this.addCls('hidden', loadingNode);
            this.disable = false;
        }
    }
}

ButtonComponent.define(ButtonComponentDefs);
ButtonComponent.use(SizeAbility);

export { ButtonComponent };
