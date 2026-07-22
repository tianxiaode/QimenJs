/**
 * AlertComponent 页面内提示条组件
 *
 * 静态嵌入页面的提示信息，支持类型色、图标、可关闭。
 * 与 Toast（浮层通知）不同，Alert 是页面流内元素。
 *
 * 模板节点：
 * - icon    — 类型图标
 * - text    — 提示内容
 * - closeBtn — 关闭按钮（可选）
 *
 * @example
 * ```ts
 * new AlertComponent({ text: '操作成功', type: 'success' })
 * new AlertComponent({ text: '请注意', type: 'warning', closable: true })
 *   .on('close', () => { ... })
 * ```
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { DOM_EVENT_PREFIX } from '@qimenjs/event-dom';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

const TYPE_ICON_MAP: Record<AlertType, string> = {
    info: 'ℹ',
    success: '✓',
    warning: '⚠',
    error: '✕',
};

export interface AlertProps {
    text?: string;
    title?: string;
    type?: AlertType;
    closable?: boolean;
}

export let AlertComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-alert',
        attrs: { role: 'alert' },
        children: [
            { tag: 'i', name: 'icon', cls: 'q-alert__icon' },
            {
                tag: 'div',
                cls: 'q-alert__body',
                children: [
                    { tag: 'div', name: 'title', cls: 'q-alert__title', hidden: true },
                    { tag: 'div', name: 'text', cls: 'q-alert__text' },
                ],
            },
            {
                tag: 'span',
                name: 'closeBtn',
                cls: 'q-alert__close',
                hidden: true,
                events: { click: { handler: true, emits: ['close'] } },
            },
        ],
    },
    body: {
        type: 'Alert',

        onAfterInit(props?: AlertProps): void {
            this._initAlert(props);
        },

        onCloseBtnClick(): void {
            this.emit('close', {});
            this.hidden = true;
        },

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
        },

        get alertType(): AlertType {
            const el = this.el as HTMLElement;
            for (const t of ['info', 'success', 'warning', 'error']) {
                if (el?.classList.contains(`q-alert--${t}`)) return t as AlertType;
            }
            return 'info';
        },
        set alertType(value: AlertType) {
            this.removeCls(`q-alert--${this.alertType}`);
            this.addCls(`q-alert--${value}`);
            this.icon = TYPE_ICON_MAP[value];
        },

        update(props?: Partial<AlertProps>): void {
            if (props?.type !== undefined) this.alertType = props.type;
            if (props?.title !== undefined) {
                this.title = props.title;
                this.setNodeHidden(!props.title, 'title');
            }
            if (props?.text !== undefined) this.text = props.text;
            if (props?.closable !== undefined) this.setNodeHidden(!props.closable, 'closeBtn');
        },
    },
});

export type AlertComponent = InstanceType<typeof AlertComponent>;
