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

import { DomEventsMap } from '@/component-core';
import { Component } from '@qimenjs/component-core';
import { ALERT_TPL } from './alert-tpl';

/** 警告提示类型 */
export type AlertType = 'info' | 'success' | 'warning' | 'error';

const TYPE_ICON_MAP: Record<AlertType, string> = {
    info: 'ℹ',
    success: '✓',
    warning: '⚠',
    error: '✕',
};

/** 警告提示属性接口 */
export interface AlertProps {
    text?: string;
    title?: string;
    type?: AlertType;
    closable?: boolean;
}

class AlertComponent extends Component {
    domEvents?: DomEventsMap | undefined = {
        click: { closeBtn: { handler: true } },
    };

    onAfterInit(props?: AlertProps): void {
        this._initAlert(props);
    }

    _initAlert(props?: AlertProps): void {
        const type: AlertType = props?.type ?? 'info';
        this.addCls(`q-alert--${type}`);
        this.icon = TYPE_ICON_MAP[type];

        if (props?.title) {
            this.title = props.title;
            this.setNodeHidden(false, 'title');
        }
        if (props?.text) this.text = props.text;
        if (props?.closable) this.setNodeHidden(false, 'closeBtn');
    }

    get alertType(): AlertType {
        for (const t of ['info', 'success', 'warning', 'error']) {
            if (this.contains(`q-alert--${t}`)) return t as AlertType;
        }
        return 'info';
    }
    set alertType(value: AlertType) {
        this.removeCls(`q-alert--${this.alertType}`);
        this.addCls(`q-alert--${value}`);
        this.icon = TYPE_ICON_MAP[value];
    }

    onCloseBtnClick() {
        this.setNodeHidden(true, 'closeBtn');
    }
    update(props?: Partial<AlertProps>): void {
        if (props?.type !== undefined) this.alertType = props.type;
        if (props?.title !== undefined) {
            this.title = props.title;
            this.setNodeHidden(!props.title, 'title');
        }
        if (props?.text !== undefined) this.text = props.text;
        if (props?.closable !== undefined) this.setNodeHidden(!props.closable, 'closeBtn');
    }
}

AlertComponent.useTemplate(ALERT_TPL);
export { AlertComponent };
/** 警告提示实例类型 */
export type AlertComponentInstance = InstanceType<typeof AlertComponent>;
