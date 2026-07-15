/**
 * MenuItemComponent 菜单项组件
 *
 * 独立组件，每个菜单项是一个组件实例。
 * 支持图标、文本、快捷键、禁用状态、子菜单、分组选中。
 *
 * 模板内容项（由 withTemplate 自动生成 getter/setter）：
 * - menuItem:content — 整行可点击区域（事件：click → onClick）
 * - menuItem:icon — 图标（分组模式下自动渲染选中指示符，与自定义 icon 互斥）
 * - menuItem:text — 文本
 * - menuItem:shortcut — 快捷键文本
 * - menuItem:expand — 子菜单展开箭头（div > i 结构）
 *
 * 分组选中：
 * - group 指定所属分组（同组互斥或共存）
 * - groupMode 控制分组模式：'radio'（单选，同组只能选一个）、'checkbox'（多选，同组可多选）
 * - checked 表示当前选中状态
 * - 选中指示符复用 icon 位：radio 用 ●/○，checkbox 用 ☑/☐
 * - 自定义 icon 与分组指示符互斥：有 group 时优先显示指示符
 *
 * 事件流：
 * - 内部事件：menuItem:content click → onClick
 *   - 切换 checked 状态（分组模式）
 *   - 通过 eventKey 触发外部事件（item:click / item:select），供 ItemGroup 转发
 *   - 调用 onSelect 回调
 *
 * 子菜单：
 * - 通过 OverlayAbility 创建子 MenuComponent 浮层
 * - hover 时自动弹出，离开时自动关闭
 *
 * @example
 * ```js
 * // 普通菜单项
 * const item = new MenuItemComponent({ text: '新建', icon: '📄', shortcut: 'Ctrl+N' });
 *
 * // 单选组
 * { text: '大图标', group: 'view', groupMode: 'radio', checked: true }
 * { text: '小图标', group: 'view', groupMode: 'radio' }
 *
 * // 多选组
 * { text: '显示状态栏', group: 'show', groupMode: 'checkbox', checked: true }
 * ```
 */

import { TemplateComponent, OverlayAbility } from '@qimenjs/component-core';
import { ExpandArrowAbility } from '@qimenjs/component-abilities';

/** 分组模式 */
export type MenuItemGroupMode = 'radio' | 'checkbox';

/** 菜单项配置 */
export interface MenuItemProps {
    /** 菜单项文本 */
    text?: string;
    /** 图标（文本或 HTML，分组模式下与指示符互斥） */
    icon?: string;
    /** 快捷键文本 */
    shortcut?: string;
    /** 是否禁用 */
    disabled?: boolean;
    /** 是否有子菜单 */
    hasSubmenu?: boolean;
    /** 所属分组名称，同组内互斥或共存 */
    group?: string;
    /** 分组模式：'radio' 单选（同组只能选一个）、'checkbox' 多选（同组可多选） */
    groupMode?: MenuItemGroupMode;
    /** 是否选中（分组模式下有效） */
    checked?: boolean;
    /** 选中回调 */
    onSelect?: (item: MenuItemComponent) => void;
    /** 子菜单配置（hasSubmenu 为 true 时有效） */
    submenuProps?: Record<string, any>;
}

/**
 * MenuItemBase — 在 withTemplate 强类基础上，通过 with() 混入 OverlayAbility
 */
const MenuItemBase = TemplateComponent
    .withTemplate({
        tpl: {
            tag: 'div',
            children: [
                { tag: 'div', name: 'menuItem:content', events: { click: { handler: true } }, className: 'q-menu-item__content', children: [
                    { tag: 'span', name: 'menuItem:icon', content: 'icon', className: 'q-menu-item__icon' },
                    { tag: 'span', name: 'menuItem:text', content: 'text', className: 'q-menu-item__text' },
                    { tag: 'span', name: 'menuItem:shortcut', content: 'text', className: 'q-menu-item__shortcut' },
                    { tag: 'div', name: 'menuItem:expand', className: 'q-expand-arrow q-expand-arrow--collapsed', hidden: true, children: [
                        { tag: 'i' },
                    ]},
                ]},
            ]
        },
        body: {
            type: 'MenuItem',
        },
    })
    .with([OverlayAbility, ExpandArrowAbility]);

export let MenuItemComponent = class extends MenuItemBase {
    /** 是否禁用 */
    private _disabled: boolean = false;

    /** 是否有子菜单 */
    private _hasSubmenu: boolean = false;

    /** 所属分组 */
    private _group: string = '';

    /** 分组模式 */
    private _groupMode: MenuItemGroupMode = 'radio';

    /** 是否选中 */
    private _checked: boolean = false;

    /** 用户自定义 icon（分组模式下与指示符互斥时暂存） */
    private _userIcon: string = '';

    /** 选中回调 */
    onSelect?: (item: MenuItemComponent) => void;

    /** 子菜单配置 */
    submenuProps?: Record<string, any>;

    /** 子菜单 hover 延迟定时器 */
    private _submenuTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(props?: MenuItemProps & Record<string, any>) {
        super(props);

        this.el.classList.add('q-menu-item');

        if (props?.text) this.text = props.text;
        if (props?.icon) this._userIcon = props.icon;
        if (props?.shortcut) this.shortcut = props.shortcut;
        if (props?.disabled) this._disabled = props.disabled;
        if (props?.hasSubmenu) this._hasSubmenu = props.hasSubmenu;
        if (props?.group) this._group = props.group;
        if (props?.groupMode) this._groupMode = props.groupMode;
        if (props?.checked) this._checked = props.checked;
        if (props?.onSelect) this.onSelect = props.onSelect;
        if (props?.submenuProps) this.submenuProps = props.submenuProps;

        this.applyState();
        this.initExpandArrow({ arrowName: 'expand' });
        this.bindHoverEvents();
    }

    /** 是否禁用 */
    get disabled(): boolean { return this._disabled; }
    set disabled(value: boolean) {
        this._disabled = value;
        this.applyState();
    }

    /** 是否有子菜单 */
    get hasSubmenu(): boolean { return this._hasSubmenu; }
    set hasSubmenu(value: boolean) {
        this._hasSubmenu = value;
        this.applyState();
    }

    /** 所属分组 */
    get group(): string { return this._group; }
    set group(value: string) {
        this._group = value;
        this.applyState();
    }

    /** 分组模式 */
    get groupMode(): MenuItemGroupMode { return this._groupMode; }
    set groupMode(value: MenuItemGroupMode) {
        this._groupMode = value;
        this.applyState();
    }

    /** 是否选中 */
    get checked(): boolean { return this._checked; }
    set checked(value: boolean) {
        this._checked = value;
        this.applyState();
    }

    // ─── 内部事件（由模板 event: 'click' 自动绑定） ───

    /**
     * menuItem:content 的 click 事件处理
     *
     * 由模板 events: ['click'] 自动绑定到 onClick handler
     * 支持 beforeClick/afterClick 钩子
     */
    onClick(): void {
        if (this._disabled) return;

        // 有子菜单时不触发选中，由 hover 处理
        if (this._hasSubmenu) return;

        // 分组模式下切换选中态
        if (this._group) {
            if (this._groupMode === 'checkbox') {
                this._checked = !this._checked;
            } else {
                // radio 模式：点击未选中项才切换
                if (!this._checked) {
                    this._checked = true;
                }
            }
            this.applyState();
        }

        // 通过 eventKey 触发外部事件（供 ItemGroup 转发）
        // eventKey 仅作为 source，不参与事件名
        if (this.eventKey) {
            this.emit('click', undefined, { source: this.eventKey });
            this.emit('select', undefined, { source: this.eventKey });
        }

        this.onSelect?.(this);
    }

    /** 应用状态到 DOM */
    private applyState(): void {
        this.el.classList.toggle('q-menu-item--disabled', this._disabled);
        this.el.classList.toggle('q-menu-item--has-submenu', this._hasSubmenu);
        this.el.classList.toggle('q-menu-item--checked', this._checked);
        this.el.classList.toggle('q-menu-item--grouped', !!this._group);

        // 分组指示符渲染到 icon 位（与自定义 icon 互斥）
        if (this._group) {
            this.renderGroupIndicator();
        } else if (this._userIcon) {
            this.icon = this._userIcon;
        }

        // 展开箭头显隐
        const expandEl = this.nodeMap?.['menuItem']?.['expand']?.el as HTMLElement | null;
        if (expandEl) {
            expandEl.hidden = !this._hasSubmenu;
        }

        // 禁用时移除交互
        if (this._disabled) {
            this.el.setAttribute('aria-disabled', 'true');
        } else {
            this.el.removeAttribute('aria-disabled');
        }

        // 分组 ARIA
        if (this._group) {
            this.el.setAttribute('role', this._groupMode === 'radio' ? 'menuitemradio' : 'menuitemcheckbox');
            this.el.setAttribute('aria-checked', String(this._checked));
        } else {
            this.el.removeAttribute('role');
            this.el.removeAttribute('aria-checked');
        }
    }

    /**
     * 渲染分组选中指示符到 icon 位
     *
     * radio 模式：●（选中）/ ○（未选中）
     * checkbox 模式：☑（选中）/ ☐（未选中）
     */
    private renderGroupIndicator(): void {
        if (this._groupMode === 'radio') {
            this.icon = this._checked ? '●' : '○';
        } else {
            this.icon = this._checked ? '☑' : '☐';
        }
    }

    /** 绑定 hover 事件，用于子菜单弹出 */
    private bindHoverEvents(): void {
        this.el.addEventListener('mouseenter', () => {
            this._clearSubmenuTimer();

            if (this._hasSubmenu && !this._disabled) {
                this._submenuTimer = setTimeout(() => {
                    this.openSubmenu();
                }, 150);
            }
        });

        this.el.addEventListener('mouseleave', () => {
            this._clearSubmenuTimer();

            if (this._hasSubmenu) {
                this._submenuTimer = setTimeout(() => {
                    this.closeSubmenu();
                }, 200);
            }
        });
    }

    /** 清除子菜单定时器 */
    private _clearSubmenuTimer(): void {
        if (this._submenuTimer) {
            clearTimeout(this._submenuTimer);
            this._submenuTimer = null;
        }
    }

    /** 打开子菜单 */
    openSubmenu(): void {
        if (!this._hasSubmenu) return;

        // 首次打开时创建子菜单浮层
        if (typeof this.openMenu !== 'function') {
            this.createOverlay({
                prefix: 'menu',
                overlayProps: {
                    placement: 'right',
                    ...this.submenuProps,
                },
            });
        }

        this.openMenu?.();
    }

    /** 关闭子菜单 */
    closeSubmenu(): void {
        this.closeMenu?.();
    }

    update(props?: Partial<MenuItemProps> & Record<string, any>): void {
        if (props?.text !== undefined) this.text = props.text;
        if (props?.icon !== undefined) this._userIcon = props.icon;
        if (props?.shortcut !== undefined) this.shortcut = props.shortcut;
        if (props?.disabled !== undefined) this.disabled = props.disabled;
        if (props?.hasSubmenu !== undefined) this.hasSubmenu = props.hasSubmenu;
        if (props?.group !== undefined) this.group = props.group;
        if (props?.groupMode !== undefined) this.groupMode = props.groupMode;
        if (props?.checked !== undefined) this.checked = props.checked;
        if (props?.onSelect !== undefined) this.onSelect = props.onSelect;
        if (props?.submenuProps !== undefined) this.submenuProps = props.submenuProps;
    }
};

export type MenuItemComponent = InstanceType<typeof MenuItemComponent>;
