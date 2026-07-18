/**
 * NavItemComponent 导航项组件
 *
 * 独立组件，每个导航项是一个组件实例。
 * 支持图标、文本、激活状态、禁用状态、子级浮层弹出。
 *
 * 模板节点：
 * - content — 可点击区域（内部事件：click → onClick）
 * - icon — 图标（IconComponent）
 * - text — 文本
 * - expand — 展开箭头
 *
 * 子级浮层：
 * - 有 children 时，点击展开箭头或导航项弹出浮层显示子导航项
 * - 浮层定位/动画等通过 overlayOptions 配置
 */

import { TemplateComponent } from '@qimenjs/component-core';

import { ExpandArrowAbility } from '@/component-abilities/render/ExpandArrowAbility';

import { ZIndexLevel, nextZIndex } from '@/component/z-index';
import { OverlayRoot } from '@/overlay/OverlayRoot';
import { IconComponent } from '../icon/IconComponent';

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
    active?: boolean;
    disabled?: boolean;
    mode?: 'expanded' | 'collapsed';
    children?: Record<string, any>[];
    overlayOptions?: NavOverlayOptions;
    overlayComponent?: any;
    depth?: number;
    maxDepth?: number;
    onSelect?: (item: any) => void;
}

const DEFAULT_ENTER_ANIMATION: Keyframe[] = [
    { opacity: 0, transform: 'translateX(-4px)' },
    { opacity: 1, transform: 'translateX(0)' },
];

const DEFAULT_EXIT_ANIMATION: Keyframe[] = [
    { opacity: 1, transform: 'translateX(0)' },
    { opacity: 0, transform: 'translateX(-4px)' },
];

export let NavItemComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'q-nav-item',
        children: [
            {
                tag: 'div',
                name: 'content',
                events: { click: { handler: true, bridges: ['click'] } },
                className: 'q-nav-item__content',
                children: [
                    { name: 'icon', type: IconComponent, className: 'q-nav-item__icon' },
                    { tag: 'span', name: 'text', className: 'q-nav-item__text' },
                    { tag: 'span', name: 'expand', className: 'q-nav-item__expand' },
                ],
            },
        ],
    },
    body: {
        type: 'NavItem',

        active: false,
        disabled: false,
        mode: 'expanded' as 'expanded' | 'collapsed',
        children: undefined as Record<string, any>[] | undefined,
        overlayOptions: undefined as NavOverlayOptions | undefined,
        overlayComponent: undefined as any,
        depth: 0,
        maxDepth: 3,
        eventKey: '',
        onSelect: undefined as ((item: any) => void) | undefined,

        _overlayEl: null as HTMLElement | null,
        _overlayContent: null as any,
        _overlayOpen: false,
        _tooltipTimer: null as ReturnType<typeof setTimeout> | null,
        _tooltipEl: null as HTMLElement | null,
        _tooltipBound: false,
        _outsideClickHandler: null as ((e: MouseEvent) => void) | null,

        forwards: {
            icon: 'icon',
        },

        onClick(): void {
            if (this.disabled) return;

            if (this.children?.length) {
                this.toggleOverlay();
                return;
            }

            this.emit('click', { item: this, index: this.props?.index });
            this.onSelect?.(this);
        },

        toggleOverlay(): void {
            if (this._overlayOpen) {
                this.closeOverlay();
            } else {
                this.openOverlay();
            }
        },

        openOverlay(): void {
            if (this._overlayOpen || !this.children?.length) return;
            if (this.depth >= this.maxDepth) return;

            const options = this.overlayOptions ?? {};
            const placement = options.placement ?? 'right-start';
            const offset = options.offset ?? 0;

            const overlayEl = document.createElement('div');
            overlayEl.className = `q-nav-overlay ${options.overlayClass ?? ''}`;
            overlayEl.style.position = 'fixed';
            overlayEl.style.zIndex = String(nextZIndex(ZIndexLevel.dropdown));

            const ContentComponent = this.overlayComponent;
            if (ContentComponent) {
                this._overlayContent = new ContentComponent({
                    items: this.children,
                    direction: 'vertical',
                    mode: this.mode,
                    depth: this.depth + 1,
                    maxDepth: this.maxDepth,
                });
                overlayEl.appendChild(this._overlayContent.el);
            } else {
                const listEl = document.createElement('div');
                listEl.className = 'q-nav-overlay__list';
                for (const child of this.children) {
                    const itemEl = document.createElement('div');
                    itemEl.className = 'q-nav-overlay__item';
                    if (child.icon) {
                        const iconEl = document.createElement('span');
                        iconEl.className = 'q-nav-overlay__item-icon';
                        iconEl.innerHTML = child.icon;
                        itemEl.appendChild(iconEl);
                    }
                    if (child.text) {
                        const textEl = document.createElement('span');
                        textEl.className = 'q-nav-overlay__item-text';
                        textEl.textContent = child.text;
                        itemEl.appendChild(textEl);
                    }
                    itemEl.addEventListener('click', () => {
                        this.emit('childClick', { item: child, parent: this });
                        this.closeOverlay();
                    });
                    listEl.appendChild(itemEl);
                }
                overlayEl.appendChild(listEl);
            }

            const root = OverlayRoot.getInstance().getRoot();
            if (root) root.appendChild(overlayEl);

            this._positionOverlay(overlayEl, placement, offset);

            const enterAnim = options.enterAnimation ?? DEFAULT_ENTER_ANIMATION;
            overlayEl.animate(enterAnim, {
                duration: options.animationDuration ?? 200,
                easing: 'ease-out',
            });

            this._overlayEl = overlayEl;
            this._overlayOpen = true;
            this._updateExpandArrow('expanded');
            this._bindOutsideClick();
            this.emit('overlayOpen', { item: this });
        },

        closeOverlay(): void {
            if (!this._overlayOpen || !this._overlayEl) return;

            const options = this.overlayOptions ?? {};
            const exitAnim = options.exitAnimation ?? DEFAULT_EXIT_ANIMATION;
            const anim = this._overlayEl.animate(exitAnim, {
                duration: options.animationDuration ?? 150,
                easing: 'ease-in',
            });

            anim.onfinish = () => {
                this._overlayEl?.remove();
                this._overlayEl = null;
                this._overlayContent?.dispose?.();
                this._overlayContent = null;
            };

            this._overlayOpen = false;
            this._updateExpandArrow('collapsed');
            this._unbindOutsideClick();
            this.emit('overlayClose', { item: this });
        },

        _positionOverlay(overlayEl: HTMLElement, placement: NavPlacement, offset: number): void {
            const anchorRect = this.el.getBoundingClientRect();
            const overlayRect = overlayEl.getBoundingClientRect();

            let top = 0;
            let left = 0;

            if (placement === 'right-start' || placement === 'right') {
                left = anchorRect.right + offset;
                top =
                    placement === 'right-start'
                        ? anchorRect.top
                        : anchorRect.top + (anchorRect.height - overlayRect.height) / 2;
            } else if (placement === 'right-end') {
                left = anchorRect.right + offset;
                top = anchorRect.bottom - overlayRect.height;
            } else if (placement === 'bottom-start' || placement === 'bottom') {
                top = anchorRect.bottom + offset;
                left =
                    placement === 'bottom-start'
                        ? anchorRect.left
                        : anchorRect.left + (anchorRect.width - overlayRect.width) / 2;
            } else if (placement === 'bottom-end') {
                top = anchorRect.bottom + offset;
                left = anchorRect.right - overlayRect.width;
            } else if (placement === 'left-start' || placement === 'left') {
                left = anchorRect.left - overlayRect.width - offset;
                top =
                    placement === 'left-start'
                        ? anchorRect.top
                        : anchorRect.top + (anchorRect.height - overlayRect.height) / 2;
            }

            const vpWidth = window.innerWidth;
            const vpHeight = window.innerHeight;
            if (left + overlayRect.width > vpWidth) left = vpWidth - overlayRect.width - 8;
            if (top + overlayRect.height > vpHeight) top = vpHeight - overlayRect.height - 8;
            if (left < 0) left = 8;
            if (top < 0) top = 8;

            overlayEl.style.top = `${top}px`;
            overlayEl.style.left = `${left}px`;
        },

        _updateExpandArrow(state: 'expanded' | 'collapsed'): void {
            const expandEl = this.nodeMap?.expand?.el as HTMLElement | null;
            if (expandEl) {
                expandEl.classList.toggle('q-nav-item__expand--expanded', state === 'expanded');
                expandEl.classList.toggle('q-nav-item__expand--collapsed', state === 'collapsed');
            }
        },

        _bindOutsideClick(): void {
            this._outsideClickHandler = (e: MouseEvent) => {
                if (
                    this._overlayEl &&
                    !this._overlayEl.contains(e.target as Node) &&
                    !this.el.contains(e.target as Node)
                ) {
                    this.closeOverlay();
                }
            };
            document.addEventListener('click', this._outsideClickHandler, true);
        },

        _unbindOutsideClick(): void {
            if (this._outsideClickHandler) {
                document.removeEventListener('click', this._outsideClickHandler, true);
                this._outsideClickHandler = null;
            }
        },

        _showTooltip(): void {
            if (this.mode !== 'collapsed' || !this.text) return;
            const tooltipEl = document.createElement('div');
            tooltipEl.className = 'q-nav-tooltip';
            tooltipEl.textContent = this.text;
            tooltipEl.style.position = 'fixed';
            tooltipEl.style.zIndex = String(nextZIndex(ZIndexLevel.tooltip));

            const rect = this.el.getBoundingClientRect();
            tooltipEl.style.left = `${rect.right + 8}px`;
            tooltipEl.style.top = `${rect.top + rect.height / 2 - 14}px`;

            const root = OverlayRoot.getInstance().getRoot();
            if (root) root.appendChild(tooltipEl);

            this._tooltipEl = tooltipEl;
        },

        _hideTooltip(): void {
            if (this._tooltipEl) {
                this._tooltipEl.remove();
                this._tooltipEl = null;
            }
        },

        _applyState(): void {
            this.el.classList.toggle('q-nav-item--active', this.active);
            this.el.classList.toggle('q-nav-item--disabled', this.disabled);
            this.el.classList.toggle('q-nav-item--collapsed', this.mode === 'collapsed');
            this.el.classList.toggle('q-nav-item--has-children', !!this.children?.length);

            const textEl = this.nodeMap?.text?.el as HTMLElement | null;
            if (textEl) {
                textEl.style.display = this.mode === 'collapsed' ? 'none' : '';
            }
            const expandEl = this.nodeMap?.expand?.el as HTMLElement | null;
            if (expandEl) {
                expandEl.style.display = this.children?.length ? '' : 'none';
            }

            if (this.disabled) {
                this.el.setAttribute('aria-disabled', 'true');
            } else {
                this.el.removeAttribute('aria-disabled');
            }

            if (this.active) {
                this.el.setAttribute('aria-current', 'page');
            } else {
                this.el.removeAttribute('aria-current');
            }

            this._setupHoverTooltip();
        },

        _setupHoverTooltip(): void {
            if (this.mode !== 'collapsed' || this._tooltipBound) return;
            this._tooltipBound = true;

            this.el.addEventListener('mouseenter', () => this._showTooltip());
            this.el.addEventListener('mouseleave', () => this._hideTooltip());
        },

        _setIcon(value: string): void {
            const iconComponent = this.icon;
            if (iconComponent?.nodeMap?.content?.el) {
                iconComponent.nodeMap.content.el.innerHTML = value;
            }
        },

        setActive(value: boolean): void {
            this.active = value;
            this._applyState();
        },

        setDisabled(value: boolean): void {
            this.disabled = value;
            this._applyState();
        },

        setMode(value: 'expanded' | 'collapsed'): void {
            this.mode = value;
            if (this._overlayOpen) this.closeOverlay();
            this._applyState();
        },

        update(props?: Partial<NavItemProps> & Record<string, any>): void {
            if (props?.text !== undefined) this.text = props.text;
            if (props?.icon !== undefined) this._setIcon(props.icon);
            if (props?.active !== undefined) this.setActive(props.active);
            if (props?.disabled !== undefined) this.setDisabled(props.disabled);
            if (props?.mode !== undefined) this.setMode(props.mode);
            if (props?.children !== undefined) this.children = props.children;
            if (props?.overlayOptions !== undefined) this.overlayOptions = props.overlayOptions;
            if (props?.overlayComponent !== undefined)
                this.overlayComponent = props.overlayComponent;
            if (props?.maxDepth !== undefined) this.maxDepth = props.maxDepth;
            if (props?.onSelect !== undefined) this.onSelect = props.onSelect;
        },

        dispose(): void {
            if (this._overlayOpen) this.closeOverlay();
            this._hideTooltip();
            this._unbindOutsideClick();
            (this.constructor as any).__proto__.dispose.call(this);
        },
    },
});

export type NavItemComponent = InstanceType<typeof NavItemComponent>;
