import { HrefComponent } from '../text/HrefComponent';
import type { TemplateDecl } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { PopoverAbility } from '@/component-abilities';
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

const NavItemComponentDefs: Definitions = {
    options: {
        iconCls: null,
        active: false,
        mode: 'expanded',
        children: null,
        popover: null,
    },
    fields: {
        overlayOptions: undefined,
        overlayComponent: undefined,
        depth: 0,
        maxDepth: 3,
    },
} as const;

class NavItemComponent extends HrefComponent {
    static type = 'nav-item';

    get tpl(): TemplateDecl {
        return NAV_ITEM_TPL;
    }

    domEvents = {};

    _overlayOpen: boolean = false;

    _onTextOptionChange(value: string): void {
        this.setNodeText(value, 'text');
        this._updateIconDisplay();
    }

    _onIconClsOptionChange(value: string): void {
        this._updateIconDisplay();
    }

    _onActiveOptionChange(value: boolean): void {
        value ? this.addCls('q-nav-item--active') : this.removeCls('q-nav-item--active');
        if (value) this.setAttributes({ 'aria-current': 'page' });
        else this.removeAttributes(['aria-current']);
    }

    _onDisableOptionChange(value: boolean): void {
        const cls = `${this._cssPrefix}--disabled`;
        value ? this.addCls(cls) : this.removeCls(cls);
        if (value) this.setAttributes({ 'aria-disabled': 'true' });
        else this.removeAttributes(['aria-disabled']);
    }

    _onModeOptionChange(value: string): void {
        if (value === 'collapsed') this.addCls('q-nav-item--collapsed');
        else this.removeCls('q-nav-item--collapsed');
        this.setNodeHidden(value === 'collapsed', 'text');
        if (this._overlayOpen) {
            this.hidePopover();
            this._overlayOpen = false;
            this.setExpandArrow('collapsed');
        }
        this._updateIconDisplay();
        if (this.popover) this.updatePopover({ mode: value });
    }

    _onChildrenOptionChange(value: Record<string, any>[]): void {
        const hasChildren = !!value?.length;
        hasChildren
            ? this.addCls('q-nav-item--has-children')
            : this.removeCls('q-nav-item--has-children');
        this.setNodeHidden(!hasChildren, 'expand');

        if (!hasChildren || this.depth >= this.maxDepth) {
            this.popover = null;
            if (this._overlayOpen) {
                this.hidePopover();
                this._overlayOpen = false;
                this.setExpandArrow('collapsed');
            }
        } else {
            const options = this.overlayOptions ?? {};
            this.popover = {
                type: this.overlayComponent ?? 'NavOverlay',
                trigger: 'manual',
                anchor: 'self',
                placement: options.placement ?? 'right-start',
                options: {
                    items: this.children,
                    mode: this.mode,
                    depth: this.depth + 1,
                    maxDepth: this.maxDepth,
                },
            };
        }
    }

    private _updateIconDisplay(): void {
        const iconEl = this.getNodeEl('icon');
        if (!iconEl) return;

        const hasIcon = !!this.iconCls;
        const isCollapsed = this.mode === 'collapsed';

        if (hasIcon) {
            iconEl.className = `q-nav-item__icon ${this.iconCls}`;
            iconEl.textContent = '';
            this.setNodeHidden(false, 'icon');
        } else if (isCollapsed && this.text) {
            iconEl.className = 'q-nav-item__icon q-nav-item__icon--fallback';
            iconEl.textContent = this.text.charAt(0);
            this.setNodeHidden(false, 'icon');
        } else {
            iconEl.className = 'q-nav-item__icon';
            iconEl.textContent = '';
            this.setNodeHidden(true, 'icon');
        }
    }

    select(): boolean {
        if (this.disable) return false;
        if (this.children?.length) {
            if (this._overlayOpen) {
                this.hidePopover();
                this._overlayOpen = false;
                this.setExpandArrow('collapsed');
            } else {
                this.showPopover();
                this._overlayOpen = true;
                this.setExpandArrow('expanded');
            }
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

        let inst = this.abilityState('navTooltip') as any;
        if (!inst) {
            const OverlayClass = this.resolveComponent('tooltip');
            if (!OverlayClass) return;

            const overlay: any = new OverlayClass({
                text: this.text,
                anchor: this.el!,
                placement: 'right',
                trigger: 'manual',
            });
            overlay.show();
            inst = { overlay };
            this.abilityState('navTooltip', () => inst);
            this.onCleanup(() => {
                overlay.dispose();
                this.setAbilityState('navTooltip', undefined);
            });
        } else {
            inst.overlay.text = this.text;
            inst.overlay.show();
        }
    }

    hideTooltip(): void {
        const inst = this.abilityState('navTooltip') as any;
        if (inst) inst.overlay.hide();
    }

    onBeforeDispose(): void {
        if (this._overlayOpen) {
            this.hidePopover();
            this._overlayOpen = false;
        }
        this.hideTooltip();
        super.onBeforeDispose();
    }
}

NavItemComponent.define(NavItemComponentDefs);
NavItemComponent.use(PopoverAbility);

export { NavItemComponent };
export type NavItemComponentInstance = InstanceType<typeof NavItemComponent>;
