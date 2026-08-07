/**
 * SpacerComponent 弹性间距组件
 *
 * flex 布局中的弹性占位，自动填充剩余空间。
 * 可通过 size 指定固定宽度/高度。
 *
 * @example
 * ```ts
 * // 弹性填充
 * new SpacerComponent()
 *
 * // 固定间距
 * new SpacerComponent({ size: 16 })
 * ```
 */

import { Component } from '@qimenjs/component-core';
import type { TplNode } from '@qimenjs/component-core';
import { SPACER_TPL } from './spacer-tpl';
import './spacer.css.ts';

/** 间距属性接口 */
export interface SpacerProps {
    size?: number;
}

class SpacerComponent extends Component {
    get tpl(): TplNode {
        return SPACER_TPL;
    }

    onAfterInit(props?: SpacerProps): void {
        if (props?.size !== undefined) {
            this.width = props.size;
        } else {
            this.addCls('q-spacer--grow');
        }
    }

    update(props?: Partial<SpacerProps>): void {
        if (props?.size !== undefined) {
            this.removeCls('q-spacer--grow');
            this.width = props.size;
        }
    }
}

export { SpacerComponent };
/** 间距实例类型 */
export type SpacerComponentInstance = InstanceType<typeof SpacerComponent>;
