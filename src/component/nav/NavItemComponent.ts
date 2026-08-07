/**
 * NavItemComponent 导航项组件
 *
 * 独立组件，每个导航项是一个组件实例。
 * 支持图标、文本、激活状态、禁用状态、子级浮层弹出。
 *
 * 模板节点：
 * - content — 可点击区域
 * - icon — 图标（DOM 节点）
 * - text — 文本
 * - expand — 展开箭头
 *
 * 子级浮层：
 * - 有 children 时，通过 FloatAbility 动态挂载 subNav 浮层
 * - trigger='manual'，由 select() 调用 showFloat/hideFloat 控制
 * - 浮层定位/动画等通过 overlayOptions 配置
 *
 * 事件处理由 NavItemGroupComponent 通过 domEvents 集中委托，
 * 本组件只提供 select() / setExpandArrow() / showTooltip() / hideTooltip() 等公开方法供父组件调用。
 */

import { Component } from '@qimenjs/component-core';
import type { FloatDecl } from '@qimenjs/component-core';
import { NAV_ITEM_TPL } from './nav-item-tpl';
import './navitem.css.ts';

/** 导航项位置类型 */
export type NavPlacement =
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'
    | 'left-start'
    | 'left-end'
    | 'right-start'
    | 'right-end';

/** 导航浮层选项 */
export interface NavOverlayOptions {
    placement?: NavPlacement;
    offset?: number;
    overlayClass?: string;
    enterAnimation?: Keyframe[];
    exitAnimation?: Keyframe[];
    animationDuration?: number;
}

/** 导航项属性接口 */
export interface NavItemProps {
    text?: string;
    icon?: string;
    path?: string;
    active?: boolean;
    disabled?: boolean;
    mode?: 'expanded' | 'collapsed';
    children?: Record<string, any>[];
    overlayOptions?: NavOverlayOptions;
    overlayComponent?: any;
    depth?: number;
    maxDepth?: number;
}

class NavItemComponent extends Component {
    active: boolean = false;
    disabled: boolean = false;
    mode: 'expanded' | 'collapsed' = 'expanded';
    path: string | undefined = undefined;
    children: Record<string, any>[] | undefined = undefined;
    overlayOptions: NavOverlayOptions | undefined = undefined;
    overlayComponent: any = undefined;
    depth: number = 0;
    maxDepth: number = 3;
    _overlayOpen: boolean = false;
    _tooltipEl: HTMLElement | null = null;

    onAfterInit(): void {
        this._applyState();
        if (this.children?.length && this.depth < this.maxDepth) {
            this.attachFloat('subNav', this._buildSubNavDecl());
        }
    }

    private _buildSubNavDecl(): FloatDecl {
        const options = this.overlayOptions ?? {};
        return {
            type: this.overlayComponent
                ? ((this.overlayComponent as any).type ?? 'NavOverlay')
                : 'NavOverlay',
            anchor: 'self',
            trigger: 'manual',
            placement: (options.placement ?? 'right-start') as any,
            offset: options.offset ?? 0,
            data: {
                items: this.children,
                mode: this.mode,
                depth: this.depth + 1,
                maxDepth: this.maxDepth,
            },
        } as FloatDecl;
    }

    select(): boolean {
        if (this.disabled) return false;

        if (this.children?.length) {
            this.toggleOverlay();
            return false;
        }

        return true;
    }

    toggleOverlay(): void {
        if (this._overlayOpen) {
            this.closeOverlay();
        } else {
            this.openOverlay();
        }
    }

    openOverlay(): void {
        if (this._overlayOpen || !this.children?.length) return;
        if (this.depth >= this.maxDepth) return;

        this.showFloat('subNav');
        this._overlayOpen = true;
        this.setExpandArrow('expanded');
        this.emit('overlayOpen', { item: this });
    }

    closeOverlay(): void {
        if (!this._overlayOpen) return;

        this.hideFloat('subNav');
        this._overlayOpen = false;
        this.setExpandArrow('collapsed');
        this.emit('overlayClose', { item: this });
    }

    setExpandArrow(state: 'expanded' | 'collapsed'): void {
        if (state === 'expanded') {
            this.addCls('q-nav-item__expand--expanded', 'expand');
            this.removeCls('q-nav-item__expand--collapsed', 'expand');
        } else {
            this.removeCls('q-nav-item__expand--expanded', 'expand');
            this.addCls('q-nav-item__expand--collapsed', 'expand');
        }
    }

    showTooltip(): void {
        if (this.mode !== 'collapsed' || !this.text) return;
        this.updateTooltip({ tooltip: this.text });
        this.showFloat('tooltip');
    }

    hideTooltip(): void {
        this.hideFloat('tooltip');
    }

    _applyState(): void {
        if (this.active) this.addCls('q-nav-item--active');
        else this.removeCls('q-nav-item--active');

        if (this.disabled) this.addCls('q-nav-item--disabled');
        else this.removeCls('q-nav-item--disabled');

        if (this.mode === 'collapsed') this.addCls('q-nav-item--collapsed');
        else this.removeCls('q-nav-item--collapsed');

        if (this.children?.length) this.addCls('q-nav-item--has-children');
        else this.removeCls('q-nav-item--has-children');

        this.setNodeHidden(this.mode === 'collapsed', 'text');
        this.setNodeHidden(!this.children?.length, 'expand');

        this.ariaDisabled = this.disabled ? 'true' : false;
        if (this.active) this.setAttr('aria-current', 'page');
        else this.removeAttr('aria-current');
    }

    _setIcon(value: string): void {
        this.icon = value;
    }

    setActive(value: boolean): void {
        this.active = value;
        this._applyState();
    }

    setDisabled(value: boolean): void {
        this.disabled = value;
        this._applyState();
    }

    setMode(value: 'expanded' | 'collapsed'): void {
        this.mode = value;
        if (this._overlayOpen) this.closeOverlay();
        this._applyState();
    }

    update(props?: Partial<NavItemProps> & Record<string, any>): void {
        if (props?.text !== undefined) this.text = props.text;
        if (props?.icon !== undefined) this._setIcon(props.icon);
        if (props?.path !== undefined) this.path = props.path;
        if (props?.active !== undefined) this.setActive(props.active);
        if (props?.disabled !== undefined) this.setDisabled(props.disabled);
        if (props?.mode !== undefined) this.setMode(props.mode);
        if (props?.children !== undefined) {
            this.children = props.children;
            if (this.children?.length && this.depth < this.maxDepth) {
                this.attachFloat('subNav', this._buildSubNavDecl());
            } else {
                this.detachFloat('subNav');
            }
        }
        if (props?.overlayOptions !== undefined) this.overlayOptions = props.overlayOptions;
        if (props?.overlayComponent !== undefined) this.overlayComponent = props.overlayComponent;
        if (props?.maxDepth !== undefined) this.maxDepth = props.maxDepth;
    }

    dispose(): void {
        if (this._overlayOpen) this.closeOverlay();
        this.hideTooltip();
        super.dispose();
    }
}

NavItemComponent.useTemplate(NAV_ITEM_TPL);
export { NavItemComponent };
/** 导航项实例类型 */
export type NavItemComponentInstance = InstanceType<typeof NavItemComponent>;
