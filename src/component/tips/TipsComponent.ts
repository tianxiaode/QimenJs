/**
 * TipsComponent 提示浮层组件
 *
 * 纯渲染组件，由 OverlayDispatchCenter 创建和管理生命周期。
 * 调度中心负责：定位计算、z-index 管理、OverlayRoot 挂载/卸载、clickOutside/escape 关闭。
 * TipsComponent 只负责：渲染内容、箭头指示器。
 *
 * 使用方式：
 * - 组件通过 body.overlays 配置声明，调度中心自动创建
 * - 调度中心调用 new TipsComponent({ anchor, tooltip, ... })
 * - 显隐由调度中心通过 hidden 属性控制
 */

import { TemplateComponent, type Placement } from '@qimenjs/component-core';
import { ArrowAbility, type ArrowConfig } from '@qimenjs/component-abilities';

export interface TipsProps {
    anchor?: HTMLElement;
    tooltip?: string;
    tooltipPlacement?: Placement;
    tooltipOffset?: number;
    tooltipShowDelay?: number;
    tooltipHideDelay?: number;
    tooltipArrow?: boolean;
}

export let TipsComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        children: [
            { tag: 'span', name: 'text', className: 'q-tips__content' },
            { tag: 'div', name: 'arrow', className: 'q-arrow' },
        ],
    },
    body: {
        type: 'tips',

        onInitState() {
            return {
                _anchor: null as HTMLElement | null,
            };
        },

        _initTips(props?: TipsProps): void {
            const anchor = props?.anchor;
            if (!anchor) return;

            this._anchor = anchor;

            if (props?.tooltip) {
                this.text = props.tooltip;
            }

            if (typeof this.initArrow === 'function') {
                this.initArrow({
                    arrow: props?.tooltipArrow ?? true,
                    arrowName: 'arrow',
                });
            }
        },

        onOverlayChange(data: any): void {
            if (!data) return;
            if (data.tooltip !== undefined) {
                this.text = data.tooltip;
            }
            if (data.visible !== undefined) {
                this.hidden = !data.visible;
            }
        },
    },
}).with([ArrowAbility]);
