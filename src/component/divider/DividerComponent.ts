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
import type { TplNode } from '@qimenjs/component-core';
import { DIVIDER_TPL } from './divider-tpl';
import './divider.css.ts';

/** 分割线属性接口 */
export interface DividerProps {
    vertical?: boolean;
    dashed?: boolean;
    text?: string;
}

class DividerComponent extends Component {
    get tpl(): TplNode {
        return DIVIDER_TPL;
    }

    onAfterInit(props?: DividerProps): void {
        this._initDivider(props);
    }

    _initDivider(props?: DividerProps): void {
        if (props?.vertical) this.addCls('q-divider--vertical');
        if (props?.dashed) this.addCls('q-divider--dashed');
        if (props?.text) {
            this.text = props.text;
            this.setNodeHidden(false, 'text');
        }
    }

    update(props?: Partial<DividerProps>): void {
        if (props?.vertical !== undefined) this.toggleCls('q-divider--vertical', props.vertical);
        if (props?.dashed !== undefined) this.toggleCls('q-divider--dashed', props.dashed);
        if (props?.text !== undefined) {
            this.text = props.text;
            this.setNodeHidden(!props.text, 'text');
        }
    }
}

export { DividerComponent };
/** 分割线实例类型 */
export type DividerComponentInstance = InstanceType<typeof DividerComponent>;
