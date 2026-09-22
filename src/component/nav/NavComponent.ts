/**
 * NavComponent 导航项组组件
 *
 * 从 ItemGroupPooledComponent 派生（池化，CSS order 布局，复用隐藏项），
 * 通过 domEvents 集中处理子项事件，委托 NavItemComponent.select() /
 * showTooltip() / hideTooltip() 执行状态变更。
 *
 * 路由内化（声明式，参考 BreadcrumbComponent）：
 * - domEvents click 带 router: 'navigate'，EventForwarder 自动 routeEmit
 * - item 有 path 时触发路由导航；无 path 则纯 UI 选中
 * - listens route change → onRouteChange 自动高亮
 * - pathIndex 可显式传入，或从 items[].path 自动构建
 *
 * 作为浮层内容使用（子菜单）：
 * - PopoverAbility 创建 NavComponent 实例时传入 anchor 选项
 * - show()/hide() 方法供 PopoverAbility 调用
 * - rawOptions?.anchor 存在时自动添加 q-nav--submenu class
 *
 * domEvents 路径：
 * - 'NavItem.content' → 点击导航项内容区域
 * - 'NavItem'        → 鼠标进入/离开导航项（折叠提示反馈）
 */

import { ItemGroupPooledComponent } from '../itemgroup/ItemGroupPooledComponent';
import type { NavItemComponent } from './NavItemComponent';
import { DomEventsMap, type TemplateDecl } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { NAV_TPL } from './nav-tpl';
import './nav.css';

const NavComponentDefs: Definitions = {
    options: {
        direction: 'vertical',
        mode: 'expanded',
        activeIndex: -1,
        pathIndex: null,
        indexPath: null,
        showToggle: false,
    },
} as const;

class NavComponent extends ItemGroupPooledComponent {
    static type = 'nav';
    defaultItemType = 'nav-item';

    get tpl(): TemplateDecl {
        return NAV_TPL;
    }

    _lastNavigatedPath: string | null = null;
    _currentNavData: { path: string; index: number } | null = null;

    domEvents?: DomEventsMap | undefined = {
        click: [
            {
                path: '[items]',
                handler: '_onItemClick',
                emits: ['[action]'],
                router: 'navigate',
            },
            {
                path: 'collapseToggle',
                handler: '_onCollapseToggle',
            },
        ],
    };

    listens = [{ route: 'router', events: { change: 'onRouteChange' } }];

    _onItemClick(domEvt: any): void {
        const target = domEvt.targetComponent;
        if (!target) return;
        if (!target.select()) return;

        this.selectAt(this.indexOf(target));

        if (target.href) {
            this._lastNavigatedPath = target.href;
            this._currentNavData = { path: target.href, index: this.indexOf(target) };
        }
    }

    _onCollapseToggle(): void {
        this.setMode(this.mode === 'expanded' ? 'collapsed' : 'expanded');
    }

    get defaultEventData(): Record<string, any> {
        return {
            ...super.defaultEventData,
            navMode: this.mode,
            activeIndex: this.activeIndex,
            ...this._currentNavData,
        };
    }

    onRouteChange(event: any): void {
        const path = event?.path;
        if (!path) return;
        if (path === this._lastNavigatedPath) {
            this._lastNavigatedPath = null;
            return;
        }
        const index = this.pathIndex?.[path];
        if (index !== undefined) this.selectAt(index);
    }

    onAfterInit(): void {
        super.onAfterInit();

        this.addCls('q-nav');
        if (this.rawOptions?.anchor) this.addCls('q-nav--submenu');
        const container = (this as any).itemContainer?.el as HTMLElement | undefined;
        if (container) container.classList.add('q-nav__items');

        if (!this.pathIndex) this._buildPathIndex(this.getData('items'));

        this.toggleCls('q-nav--collapsed', this.mode === 'collapsed');

        this.setNodeHidden(!this.getData('showToggle'), 'collapseToggle');

        this._syncItemConfig();

        const hash = typeof window !== 'undefined' ? window.location.hash : '';
        if (hash) {
            const routePath = hash.slice(1);
            const routeIndex = this.pathIndex?.[routePath];
            if (routeIndex !== undefined && routeIndex !== this.activeIndex) {
                this.selectAt(routeIndex, true);
            }
        }

        if (this.activeIndex >= 0) {
            this.selectAt(this.activeIndex, true);
        }
    }

    show(): void {
        const anchor = this.anchor ?? this.rawOptions?.anchor ?? this.el!;
        const placement = this.placement ?? this.rawOptions?.placement;
        this._showOverlay({ anchor, placement });
    }

    hide(): void {
        this._hideOverlay();
    }

    private _buildPathIndex(items?: Record<string, any>[]): void {
        this.pathIndex = {};
        if (!items?.length) return;
        for (let i = 0; i < items.length; i++) {
            const href = items[i]?.href;
            if (href) this.pathIndex[href] = i;
        }
    }

    _syncItemConfig(): void {
        for (let i = 0; i < this.count; i++) {
            const item = this.getAt(i) as NavItemComponent;
            item.update({ mode: this.mode });
        }
    }

    selectAt(index: number, silent: boolean = false): void {
        if (index < 0 || index >= this.count) return;

        if (this.activeIndex >= 0 && this.activeIndex < this.count && this.activeIndex !== index) {
            const prevItem = this.getAt(this.activeIndex) as NavItemComponent;
            prevItem.setActive(false);
        }

        const newItem = this.getAt(index) as NavItemComponent;
        newItem.setActive(true);
        this.activeIndex = index;

        if (!silent) {
            this.emit('select', { index });
        }
    }

    clearSelection(): void {
        if (this.activeIndex >= 0 && this.activeIndex < this.count) {
            const item = this.getAt(this.activeIndex) as NavItemComponent;
            item.setActive(false);
        }
        this.activeIndex = -1;
    }

    setMode(value: 'expanded' | 'collapsed'): void {
        this.mode = value;
        this.toggleCls('q-nav--collapsed', value === 'collapsed');

        for (let i = 0; i < this.count; i++) {
            const item = this.getAt(i) as NavItemComponent;
            item.setMode(value);
        }
    }

    onUpdated(props?: Record<string, any>): void {
        if (props?.activeIndex !== undefined) this.selectAt(props.activeIndex);
        if (props?.mode !== undefined) this.setMode(props.mode);
    }
}

NavComponent.define(NavComponentDefs);

export { NavComponent };
export type NavComponentInstance = InstanceType<typeof NavComponent>;
