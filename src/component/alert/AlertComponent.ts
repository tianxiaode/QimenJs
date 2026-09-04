/**
 * AlertComponent 页面内提示条组件
 *
 * 静态嵌入页面的提示信息，支持类型色、图标、可关闭。
 * 与 Toast（浮层通知）不同，Alert 是页面流内元素。
 *
 * 模板节点：
 * - icon    — 类型图标
 * - title   — 标题（默认隐藏）
 * - text    — 提示内容
 * - closeBtn — 关闭按钮（默认隐藏）
 *
 * @example
 * ```ts
 * new AlertComponent({ text: '操作成功', type: 'success' })
 * new AlertComponent({ text: '请注意', type: 'warning', closable: true })
 *   .on('close', () => { ... })
 * ```
 */

import { DomEventsMap, TemplateDecl } from '@/component-core';
import { Component } from '@qimenjs/component-core';
import './alert.css';
import { Definitions } from '@/composable';

/** 警告提示类型 */
export type AlertType = 'info' | 'success' | 'warning' | 'error';

/** 警告提示模板定义 */
const ALERT_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-alert',
    attributes: { role: 'alert' },
    children: [
        { tag: 'i', name: 'icon', classes: 'q-alert__icon' },
        {
            tag: 'div',
            classes: 'q-alert__body',
            children: [
                { tag: 'div', name: 'title', classes: 'q-alert__title hidden' },
                { tag: 'div', name: 'text', classes: 'q-alert__text' },
            ],
        },
        {
            tag: 'span',
            name: 'closeBtn',
            classes: 'q-alert__close hidden',
        },
    ],
};

/** 警告提示属性接口 */
const AlertComponentDefs: Definitions = {
    targetToOptions: {
        text: { target: 'text', to: 'text' },
        title: { target: 'title', to: 'text' },
    },
    options: {
        alertType: 'info',
        closable: true,
    },
};

class AlertComponent extends Component {
    get tpl(): TemplateDecl {
        return ALERT_TPL;
    }

    domEvents?: DomEventsMap | undefined = {
        click: { closeBtn: { handler: true } },
    };

    onAfterInit(): void {
        this._initAlert();
    }

    _onAlertTypeOptionChange(value: AlertType, old: AlertType): void {
        if (value) this.addCls(`q-alert--${value}`);
        if (old) this.removeCls(`q-alert--${old}`);
    }

    _onTitleOptionChange(value: string, _old: string): void {
        value ? this.removeCls('hidden', 'title') : this.addCls('hidden', 'title');
    }

    _onClosableOptionChange(value: boolean, _old: boolean): void {
        value ? this.removeCls('hidden', 'closeBtn') : this.addCls('hidden', 'closeBtn');
    }

    onCloseBtnClick() {
        this.dispose();
    }
}

AlertComponent.define(AlertComponentDefs);
export { AlertComponent };
