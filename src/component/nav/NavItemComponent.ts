import { Component } from '@qimenjs/component-core';
import type { TemplateDecl, FloatDecl } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { NAV_ITEM_TPL } from './nav-item-tpl';
import './nav-item.css';

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

export interface NavOverlayOptions {
    placement?: NavPlacement;
    offset?: number;
    overlayClass?: string;
    enterAnimation?: Keyframe[];
    exitAnimation?: Keyframe[];
    animationDuration?: number;
}

export interface NavItemProps {
    text?: string;
    icon?: string;
    path?: string;
    active?: boolean;
    disable?: boolean;
    mode?: 'expanded' | 'collapsed';
    children?: Record<string, any>[];
    overlayOptions?: NavOverlayOptions;
    overlayComponent?: any;
    depth?: number;
    maxDepth?: number;
}

const NavItemComponentDefs: Definitions = {
    options: {
        text: null,
        icon: null,
        active: false,
        mode: 'expanded',
        children: null,
    },
    fields: {
        path: undefined,
        overlayOptions: undefined,
        overlayComponent: undefined,
        depth: 0,
        maxDepth: 3,
    },
} as const;

class NavItemComponent extends Component {
    static type = 'nav-item';

    get tpl(): TemplateDecl {
        return NAV_ITEM_TPL;
    }

    _overlayOpen: boolean = false;

    _onTextOptionChange(value: string): void {
        this._setNodeText('text', value);
    }

    _onIconOptionChange(value: string): void {
        const el = this.getNodeEl('icon');
        if (el) el.innerHTML = value ?? '';
    }

    _onActiveOptionChange(value: boolean): void {
        value ? this.addCls('q-nav-item--active') : this.removeCls('q-nav-item--active');
        if (value) this.setAttributes({ 'aria-current': 'page' });
        else this.removeAttributes(['aria-current']);
    }

    _onDisableOptionChange(value: boolean): void {
        const cls = this._composeStateCls(null, 'disabled');
        value ? this.addCls(cls) : this.removeCls(cls);
        if (value) this.setAttributes({ 'aria-disabled': 'true' });
        else this.removeAttributes(['aria-disabled']);
    }

    _onModeOptionChange(value: string): void {
        if (value === 'collapsed') this.addCls('q-nav-item--collapsed');
        else this.removeCls('q-nav-item--collapsed');
        this._setNodeHidden(value === 'collapsed', 'text');
        if (this._overlayOpen) this.closeOverlay();
    }

    _onChildrenOptionChange(value: Record<string, any>[]): void {
        const hasChildren = !!value?.length;
        hasChildren ? this.addCls('q-nav-item--has-children') : this.removeCls('q-nav-item--has-children');
        this._setNodeHidden(!hasChildren, 'expand');
        if (hasChildren && this.depth < this.maxDepth) {
            this.attachFloat('subNav', this._buildSubNavDecl());
        } else {
            this.detachFloat('subNav');
        }
    }

    select(): boolean {
        if (this.disable) return false;
        if (this.children?.length) {
            this.toggleOverlay();
            return false;
        }
        return true;
    }

    setActive(value: boolean): void {
        this.active = value;
    }

    setMode(value: 'expanded' | 'collapsed'): void {
        this.mode = value;
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
        this.updateFloat('tooltip', { tooltip: this.text });
        this.showFloat('tooltip');
    }

    hideTooltip(): void {
        this.hideFloat('tooltip');
    }

    toggleOverlay(): void {
        if (this._overlayOpen) this.closeOverlay();
        else this.openOverlay();
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

    onBeforeDispose(): void {
        if (this._overlayOpen) this.closeOverlay();
        this.hideTooltip();
        super.onBeforeDispose();
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
}

NavItemComponent.define(NavItemComponentDefs);

export { NavItemComponent };
export type NavItemComponentInstance = InstanceType<typeof NavItemComponent>;
