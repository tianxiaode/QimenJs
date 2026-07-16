/**
 * NavItemComponent 导航项组件
 *
 * 独立组件，每个导航项是一个组件实例。
 * 支持图标、文本、激活状态、禁用状态、子级浮层弹出。
 *
 * 模板内容项（由 withTemplate 自动生成 getter/setter）：
 * - navItem:content — 可点击区域（内部事件：click → onClick）
 * - navItem:icon — 图标
 * - navItem:text — 文本
 * - navItem:expand — 展开箭头（有 children 时显示）
 *
 * 事件流：
 * - 内部事件：navItem:content click → onClick（handler: true 自动推导）
 * - 桥接事件：bridges: ['click'] → 自动通过 EventBridge 发布
 * - toggle 事件：展开箭头点击时触发，{ state: 'expanded' | 'collapsed' }
 *
 * 子级浮层：
 * - 有 children 时，点击展开箭头或导航项弹出浮层显示子导航项
 * - 浮层通过 FloatingLayerAbility 挂载到 OverlayRoot
 * - 浮层内容默认渲染 NavItemGroupComponent，可通过 overlayComponent 替换
 * - 浮层定位/动画等通过 overlayOptions 配置
 *
 * 显示模式：
 * - expanded（默认）：图标 + 文本并排
 * - collapsed：仅显示图标，hover 时弹出 tooltip 显示文本
 *
 * @example
 * ```js
 * // 简单导航项
 * const item = new NavItemComponent({ text: '首页', icon: '🏠' });
 *
 * // 带子级的导航项
 * const item = new NavItemComponent({
 *     text: '系统管理', icon: '⚙️',
 *     children: [
 *         { text: '用户管理', icon: '👤' },
 *         { text: '角色管理', icon: '🔑' },
 *     ],
 * });
 *
 * // 自定义浮层配置
 * const item = new NavItemComponent({
 *     text: '系统管理', icon: '⚙️',
 *     children: [...],
 *     overlayOptions: { placement: 'right', offset: 8 },
 * });
 * ```
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { FloatingLayerAbility } from '@/component-abilities/render/FloatingLayerAbility';
import { ExpandArrowAbility } from '@/component-abilities/render/ExpandArrowAbility';
import { TooltipOverlayAbility } from '@/component-abilities/render/TooltipOverlayAbility';
import { OverlayHostAbility } from '@qimenjs/component-core';
import { ZIndexLevel, nextZIndex } from '@/component/z-index';
import { OverlayRoot } from '@/component/OverlayRoot';

/** 导航浮层弹出方向 */
export type NavPlacement = 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';

/** 浮层配置 */
export interface NavOverlayOptions {
    /** 弹出方向，默认 'right-start' */
    placement?: NavPlacement;
    /** 间距 px，默认 0 */
    offset?: number;
    /** 浮层额外 CSS 类名 */
    overlayClass?: string;
    /** 进入动画 keyframes，默认 fade */
    enterAnimation?: Keyframe[];
    /** 退出动画 keyframes，默认 fade */
    exitAnimation?: Keyframe[];
    /** 动画时长 ms，默认 200 */
    animationDuration?: number;
}

/** 导航项配置 */
export interface NavItemProps {
    /** 导航项文本 */
    text?: string;
    /** 图标（文本或 HTML） */
    icon?: string;
    /** 是否激活 */
    active?: boolean;
    /** 是否禁用 */
    disabled?: boolean;
    /** 显示模式：expanded=图标+文本，collapsed=仅图标 */
    mode?: 'expanded' | 'collapsed';
    /** 子导航项数据 */
    children?: Record<string, any>[];
    /** 浮层配置 */
    overlayOptions?: NavOverlayOptions;
    /** 自定义浮层内容组件类（默认 NavItemGroupComponent） */
    overlayComponent?: any;
    /** 当前层级深度（内部使用，由 NavItemGroup 传入） */
    depth?: number;
    /** 最大层级深度（默认 3） */
    maxDepth?: number;
    /** 选中回调 */
    onSelect?: (item: any) => void;
}

/** 默认浮层进入动画 */
const DEFAULT_ENTER_ANIMATION: Keyframe[] = [
    { opacity: 0, transform: 'translateX(-4px)' },
    { opacity: 1, transform: 'translateX(0)' },
];

/** 默认浮层退出动画 */
const DEFAULT_EXIT_ANIMATION: Keyframe[] = [
    { opacity: 1, transform: 'translateX(0)' },
    { opacity: 0, transform: 'translateX(-4px)' },
];

export let NavItemComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'q-nav-item',
        children: [
            { tag: 'div', name: 'navItem:content', events: { click: { handler: true, bridges: ['click'] } }, className: 'q-nav-item__content', children: [
                { tag: 'span', name: 'navItem:icon', content: 'icon', className: 'q-nav-item__icon' },
                { tag: 'span', name: 'navItem:text', content: 'text', className: 'q-nav-item__text' },
                { tag: 'span', name: 'navItem:expand', className: 'q-nav-item__expand' },
            ]},
        ]
    },
    body: {
        type: 'NavItem',

        /** 是否激活 */
        active: false,

        /** 是否禁用 */
        disabled: false,

        /** 显示模式 */
        mode: 'expanded' as 'expanded' | 'collapsed',

        /** 子导航项数据 */
        children: undefined as Record<string, any>[] | undefined,

        /** 浮层配置 */
        overlayOptions: undefined as NavOverlayOptions | undefined,

        /** 自定义浮层内容组件类 */
        overlayComponent: undefined as any,

        /** 当前层级深度 */
        depth: 0,

        /** 最大层级深度 */
        maxDepth: 3,

        /** 事件源标识（由 ItemGroup 注入） */
        eventKey: '',

        /** 选中回调 */
        onSelect: undefined as ((item: any) => void) | undefined,

        /** 浮层 DOM 元素 */
        _overlayEl: null as HTMLElement | null,

        /** 浮层内容组件实例 */
        _overlayContent: null as any,

        /** 浮层是否打开 */
        _overlayOpen: false,

        /** tooltip 定时器 */
        _tooltipTimer: null as ReturnType<typeof setTimeout> | null,

        /**
         * navItem:content 的 click 事件处理
         */
        onClick(): void {
            if (this.disabled) return;

            // 有子级时切换浮层
            if (this.children?.length) {
                this.toggleOverlay();
                return;
            }

            this.emit('click', { item: this, index: this.props?.index });
            this.onSelect?.(this);
        },

        /**
         * 切换浮层显示/隐藏
         */
        toggleOverlay(): void {
            if (this._overlayOpen) {
                this.closeOverlay();
            } else {
                this.openOverlay();
            }
        },

        /**
         * 打开子级浮层
         */
        openOverlay(): void {
            if (this._overlayOpen || !this.children?.length) return;

            // 检查层级深度
            if (this.depth >= this.maxDepth) return;

            const options = this.overlayOptions ?? {};
            const placement = options.placement ?? 'right-start';
            const offset = options.offset ?? 0;

            // 创建浮层容器
            const overlayEl = document.createElement('div');
            overlayEl.className = `q-nav-overlay ${options.overlayClass ?? ''}`;
            overlayEl.style.position = 'fixed';
            overlayEl.style.zIndex = String(nextZIndex(ZIndexLevel.dropdown));

            // 创建浮层内容组件
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
                // 默认：创建简单的子项列表
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

            // 挂载到 OverlayRoot
            const root = OverlayRoot.getInstance().getRoot();
            if (root) {
                root.appendChild(overlayEl);
            }

            // 定位浮层
            this._positionOverlay(overlayEl, placement, offset);

            // 播放进入动画
            const enterAnim = options.enterAnimation ?? DEFAULT_ENTER_ANIMATION;
            overlayEl.animate(enterAnim, {
                duration: options.animationDuration ?? 200,
                easing: 'ease-out',
            });

            this._overlayEl = overlayEl;
            this._overlayOpen = true;

            // 更新展开箭头状态
            this._updateExpandArrow('expanded');

            // 点击外部关闭
            this._bindOutsideClick();

            this.emit('overlayOpen', { item: this });
        },

        /**
         * 关闭子级浮层
         */
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

        /**
         * 定位浮层到锚点旁边
         */
        _positionOverlay(overlayEl: HTMLElement, placement: NavPlacement, offset: number): void {
            const anchorRect = this.el.getBoundingClientRect();
            const overlayRect = overlayEl.getBoundingClientRect();

            let top = 0;
            let left = 0;

            if (placement === 'right-start' || placement === 'right') {
                left = anchorRect.right + offset;
                top = placement === 'right-start' ? anchorRect.top : anchorRect.top + (anchorRect.height - overlayRect.height) / 2;
            } else if (placement === 'right-end') {
                left = anchorRect.right + offset;
                top = anchorRect.bottom - overlayRect.height;
            } else if (placement === 'bottom-start' || placement === 'bottom') {
                top = anchorRect.bottom + offset;
                left = placement === 'bottom-start' ? anchorRect.left : anchorRect.left + (anchorRect.width - overlayRect.width) / 2;
            } else if (placement === 'bottom-end') {
                top = anchorRect.bottom + offset;
                left = anchorRect.right - overlayRect.width;
            } else if (placement === 'left-start' || placement === 'left') {
                left = anchorRect.left - overlayRect.width - offset;
                top = placement === 'left-start' ? anchorRect.top : anchorRect.top + (anchorRect.height - overlayRect.height) / 2;
            }

            // 视口边界修正
            const vpWidth = window.innerWidth;
            const vpHeight = window.innerHeight;
            if (left + overlayRect.width > vpWidth) left = vpWidth - overlayRect.width - 8;
            if (top + overlayRect.height > vpHeight) top = vpHeight - overlayRect.height - 8;
            if (left < 0) left = 8;
            if (top < 0) top = 8;

            overlayEl.style.top = `${top}px`;
            overlayEl.style.left = `${left}px`;
        },

        /**
         * 更新展开箭头状态
         */
        _updateExpandArrow(state: 'expanded' | 'collapsed'): void {
            const nodeMap = this.nodeMap as Record<string, { el: HTMLElement }> | undefined;
            if (!nodeMap) return;
            const expandEl = nodeMap['expand']?.el;
            if (expandEl) {
                expandEl.classList.toggle('q-nav-item__expand--expanded', state === 'expanded');
                expandEl.classList.toggle('q-nav-item__expand--collapsed', state === 'collapsed');
            }
        },

        /**
         * 绑定点击外部关闭
         */
        _outsideClickHandler: null as ((e: MouseEvent) => void) | null,

        _bindOutsideClick(): void {
            this._outsideClickHandler = (e: MouseEvent) => {
                if (this._overlayEl && !this._overlayEl.contains(e.target as Node) && !this.el.contains(e.target as Node)) {
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

        /**
         * 显示 tooltip（collapsed 模式下 hover 时）
         */
        _showTooltip(): void {
            if (this.mode !== 'collapsed' || !this.text) return;
            // 复用 TipsComponent 的简单 tooltip
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

        /**
         * 隐藏 tooltip
         */
        _hideTooltip(): void {
            if (this._tooltipEl) {
                this._tooltipEl.remove();
                this._tooltipEl = null;
            }
        },

        /** tooltip DOM 元素 */
        _tooltipEl: null as HTMLElement | null,

        /** 应用状态到 DOM */
        _applyState(): void {
            this.el.classList.toggle('q-nav-item--active', this.active);
            this.el.classList.toggle('q-nav-item--disabled', this.disabled);
            this.el.classList.toggle('q-nav-item--collapsed', this.mode === 'collapsed');
            this.el.classList.toggle('q-nav-item--has-children', !!(this.children?.length));

            // collapsed 模式下隐藏文本
            const nodeMap = this.nodeMap as Record<string, { el: HTMLElement }> | undefined;
            if (nodeMap) {
                const textEl = nodeMap['text']?.el;
                if (textEl) {
                    textEl.style.display = this.mode === 'collapsed' ? 'none' : '';
                }
                const expandEl = nodeMap['expand']?.el;
                if (expandEl) {
                    expandEl.style.display = this.children?.length ? '' : 'none';
                }
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

            // collapsed 模式下绑定 hover tooltip
            this._setupHoverTooltip();
        },

        /**
         * 设置 hover tooltip 事件
         */
        _tooltipBound: false,

        _setupHoverTooltip(): void {
            if (this.mode !== 'collapsed' || this._tooltipBound) return;
            this._tooltipBound = true;

            this.el.addEventListener('mouseenter', () => this._showTooltip());
            this.el.addEventListener('mouseleave', () => this._hideTooltip());
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
            // 切换模式时关闭浮层
            if (this._overlayOpen) this.closeOverlay();
            this._applyState();
        },

        update(props?: Partial<NavItemProps> & Record<string, any>): void {
            if (props?.text !== undefined) this.text = props.text;
            if (props?.icon !== undefined) this.icon = props.icon;
            if (props?.active !== undefined) this.setActive(props.active);
            if (props?.disabled !== undefined) this.setDisabled(props.disabled);
            if (props?.mode !== undefined) this.setMode(props.mode);
            if (props?.children !== undefined) this.children = props.children;
            if (props?.overlayOptions !== undefined) this.overlayOptions = props.overlayOptions;
            if (props?.overlayComponent !== undefined) this.overlayComponent = props.overlayComponent;
            if (props?.maxDepth !== undefined) this.maxDepth = props.maxDepth;
            if (props?.onSelect !== undefined) this.onSelect = props.onSelect;
        },

        dispose(): void {
            if (this._overlayOpen) this.closeOverlay();
            this._hideTooltip();
            this._unbindOutsideClick();
            super.dispose();
        },
    },
});

export type NavItemComponent = InstanceType<typeof NavItemComponent>;
