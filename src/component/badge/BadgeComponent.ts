/**
 * BadgeComponent 角标组件
 *
 * 纯渲染组件，由 OverlayDispatchCenter 创建和管理生命周期。
 * 调度中心负责：定位计算、z-index 管理、OverlayRoot 挂载/卸载。
 * BadgeComponent 只负责：渲染内容、文本更新、显隐控制。
 *
 * onOverlayChange(data) 默认实现：通过自动生成的 text/hidden 属性更新。
 */

import { Component } from '@qimenjs/component-core';
import { BADGE_TPL } from './badge-tpl';
import './badge.css.ts';

/** 徽标组件 */
class BadgeComponent extends Component {
    onOverlayChange(data: any): void {
        if (!data) return;
        if (data.text !== undefined) {
            this.text = String(data.text);
            this.hidden = !data.text;
        }
        if (data.visible !== undefined) {
            this.hidden = !data.visible;
        }
    }
}

BadgeComponent.useTemplate(BADGE_TPL);
export { BadgeComponent };
/** 徽标实例类型 */
export type BadgeComponentInstance = InstanceType<typeof BadgeComponent>;
