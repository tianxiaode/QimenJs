/**
 * TipsComponent 提示浮层组件
 *
 * 浮层组件，由 TooltipAbility 通过 OverlayAbility.createOverlay() 创建。
 * 自身负责：
 * - 定位计算、z-index 管理、OverlayRoot 挂载（由 OverlayHostAbility 提供）
 * - hover 事件监听、显示/隐藏延迟
 * - open/close 生命周期
 * - dispose 时清理所有资源
 *
 * 组合：OverlayHostAbility + hover 事件 + delay
 *
 * OverlayHostAbility 已包含在 TEMPLATE_COMPONENT_ABILITIES 中，
 * 无需额外 with() 注入。
 */

import { TemplateComponent, TIPS_TEMPLATE, type Placement } from '@qimenjs/component-core';

/**
 * Tips 组件 props
 */
export interface TipsProps {
    /** 锚点元素 */
    anchor?: HTMLElement;
    /** 提示文本 */
    tooltip?: string;
    /** 弹出方向，默认 'top' */
    tooltipPlacement?: Placement;
    /** 间距，默认 4 */
    tooltipOffset?: number;
    /** 显示延迟，默认 0 */
    tooltipShowDelay?: number;
    /** 隐藏延迟，默认 0 */
    tooltipHideDelay?: number;
}

/**
 * TipsComponent — 提示浮层组件
 *
 * 继承 TemplateComponent（已含 OverlayHostAbility）+ TIPS_TEMPLATE
 */
export let TipsComponent = TemplateComponent.withTemplate(TIPS_TEMPLATE);

TipsComponent.prototype.type = 'tips';

/**
 * 初始化 Tips 组件
 *
 * 在构造函数中调用，设置锚点、定位配置、hover 事件监听。
 */
TipsComponent.prototype._initTips = function(props?: TipsProps): void {
    const anchor = props?.anchor;
    if (!anchor) return;

    // 初始化 OverlayHostAbility
    this.initOverlayHost({
        placement: props?.tooltipPlacement ?? 'top',
        offset: props?.tooltipOffset ?? 4,
        flip: true,
    });

    // 保存锚点
    this._anchor = anchor;

    // 设置提示文本
    if (props?.tooltip) {
        this.default = props.tooltip;
    }

    // 绑定 hover 事件
    const showDelay = props?.tooltipShowDelay ?? 0;
    const hideDelay = props?.tooltipHideDelay ?? 0;

    this.bind(anchor, 'hover', {
        delay: showDelay,
        onEnter: () => this.open(),
        onLeave: () => {
            setTimeout(() => this.close(), hideDelay);
        },
    });
};

/**
 * 打开浮层
 */
TipsComponent.prototype.open = function(): void {
    this.openOverlay();
    this.acquireZIndex();
    this.positionOverlay();
    this.el.style.display = '';
};

/**
 * 关闭浮层
 */
TipsComponent.prototype.close = function(): void {
    this.closeOverlay();
    this.el.style.display = 'none';
    this.releaseZIndex();
};
