/**
 * DividerComponent 分割线组件
 *
 * 水平/垂直分割线，支持文字标签和虚线样式。
 *
 * @example
 * ```ts
 * new DividerComponent()
 * new DividerComponent({ vertical: true })
 * new DividerComponent({ text: '或者' })
 * new DividerComponent({ dashed: true })
 * ```
 */

import { Component } from '@qimenjs/component-core';

export interface DividerProps {
    vertical?: boolean;
    dashed?: boolean;
    text?: string;
}

export let DividerComponent = Component.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-divider',
        attrs: { role: 'separator' },
        children: [{ tag: 'span', name: 'text', cls: 'q-divider__text', hidden: true }],
    },
    body: {
        type: 'Divider',

        onAfterInit(props?: DividerProps): void {
            this._initDivider(props);
        },

        _initDivider(props?: DividerProps): void {
            if (props?.vertical) this.addCls('q-divider--vertical');
            if (props?.dashed) this.addCls('q-divider--dashed');
            if (props?.text) {
                this.text = props.text;
                this.setNodeHidden(false, 'text');
            }
        },

        update(props?: Partial<DividerProps>): void {
            if (props?.vertical !== undefined)
                this.toggleCls('q-divider--vertical', props.vertical);
            if (props?.dashed !== undefined) this.toggleCls('q-divider--dashed', props.dashed);
            if (props?.text !== undefined) {
                this.text = props.text;
                this.setNodeHidden(!props.text, 'text');
            }
        },
    },
});

export type DividerComponent = InstanceType<typeof DividerComponent>;
