/**
 * TooltipComponent 提示浮层组件
 *
 * 纯渲染组件，由 OverlayDispatchCenter 创建和管理生命周期。
 * 调度中心负责：定位计算、z-index 管理、OverlayRoot 挂载/卸载、clickOutside/escape 关闭。
 * TooltipComponent 只负责：渲染内容、箭头指示器。
 *
 * 使用方式：
 * - 组件通过 body.floats 配置声明，调度中心自动创建
 * - 调度中心调用 new TooltipComponent({ anchor, tooltip, ... })
 * - 显隐由调度中心通过 hidden 属性控制
 */

import { Component } from '@qimenjs/component-core';
import { ArrowAbility } from '@qimenjs/component-abilities';
import { ZIndexLevel, nextZIndex } from '../';
import { TOOLTIP_TPL } from './tooltip-tpl';
import { InferAbility } from '@/composable';

export interface TooltipProps {
    anchor?: HTMLElement;
    tooltip?: string;
    tooltipPlacement?: string;
    tooltipOffset?: number;
    tooltipShowDelay?: number;
    tooltipHideDelay?: number;
    tooltipArrow?: boolean;
}

export class TooltipComponent extends Component {
    _anchor: HTMLElement | null = null;
    _overlayOpen: boolean = false;

    _initTooltip(props?: TooltipProps): void {
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
    }

    initOverlayHost(): void {
        this.el.style.display = 'none';
        this.el.style.position = 'fixed';
    }

    open(): void {
        this.el.style.display = '';
        this.el.style.zIndex = String(nextZIndex(ZIndexLevel.tooltip));
        this._overlayOpen = true;
        if (this._anchor && typeof this.updateArrowPlacement === 'function') {
            const anchorRect = this._anchor.getBoundingClientRect();
            const elRect = this.el.getBoundingClientRect();
            const placement = this._inferPlacement(anchorRect, elRect);
            this.updateArrowPlacement(placement);
        }
    }

    close(): void {
        this.el.style.display = 'none';
        this._overlayOpen = false;
    }

    _inferPlacement(anchorRect: DOMRect, elRect: DOMRect): 'top' | 'bottom' | 'left' | 'right' {
        const spaceAbove = anchorRect.top;
        const spaceBelow = window.innerHeight - anchorRect.bottom;
        const spaceLeft = anchorRect.left;
        const spaceRight = window.innerWidth - anchorRect.right;
        const max = Math.max(spaceAbove, spaceBelow, spaceLeft, spaceRight);
        if (max === spaceAbove) return 'bottom';
        if (max === spaceBelow) return 'top';
        if (max === spaceLeft) return 'right';
        return 'left';
    }

    onOverlayChange(data: any): void {
        if (!data) return;
        if (data.tooltip !== undefined) {
            this.text = data.tooltip;
        }
        if (data.visible !== undefined) {
            this.hidden = !data.visible;
        }
    }
}

TooltipComponent.use(ArrowAbility);
TooltipComponent.useTemplate(TOOLTIP_TPL);

export interface TooltipComponent extends InferAbility<typeof ArrowAbility> {}
