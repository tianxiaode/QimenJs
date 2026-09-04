/**
 * SpacerComponent 弹性间距组件
 *
 * flex 布局中的弹性占位，自动填充剩余空间。
 * 可通过 size 指定固定宽度。
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
import type { TemplateDecl } from '@/component-core';
import { SPACER_TPL } from './spacer-tpl';
import './spacer.css';

class SpacerComponent extends Component {
    static type = 'spacer';
    get tpl(): TemplateDecl {
        return SPACER_TPL;
    }
}

export { SpacerComponent };
