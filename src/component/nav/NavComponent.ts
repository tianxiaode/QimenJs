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
 * 深度模型：
 * - maxDepth（默认 3）：子级浮层挂载的硬上限，depth >= maxDepth 不再挂浮层
 *
 * domEvents 路径：
 * - 'NavItem.content' → 点击导航项内容区域
 * - 'NavItem'        → 鼠标进入/离开导航项（折叠提示反馈）
 */

import { ItemGroupPooledComponent } from '../itemgroup/ItemGroupPooledComponent';
import type { NavItemComponent, NavOverlayOptions } from './NavItemComponent';
import { DomEventsMap, type TemplateDecl } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { RouteEventBus } from '@/events';
import type { EventContext } from '@/context';
import { NAV_TPL } from './nav-tpl';
import './nav.css';

const NavComponentDefs: Definitions = {
    options: {
        direction: 'vertical',
        mode: 'expanded',
        maxDepth: 3,
        activeIndex: -1,
        pathIndex: null,
        indexPath: null,
        overlayOptions: null,
        overlayComponent: null,
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
                path: '{nav-item}.content',
                handler: '_onItemClick',
                emits: ['[action]'],
                router: 'navigate',
            },
            {
                path: 'collapseToggle',
                handler: '_onCollapseToggle',
            },
        ],
        enter: { path: '{nav-item}', handler: '_onItemEnter' },
        leave: { path: '{nav-item}', handler: '_onItemLeave' },
    };

    listens = [{ route: 'router', events: { change: 'onRouteChange' } }];

    routerEmit(ctx: EventContext): void {
        RouteEventBus.getInstance().routeEmit(ctx);
    }

    _onItemClick(domEvt: any): void {
        const target = this.getTargetItem(domEvt.target);
        if (!target) return;

        const item = target.component as NavItemComponent;
        if (item.select()) {
            this.selectAt(target.index);
        }

        if (item.path) {
            this._lastNavigatedPath = item.path;
            this._currentNavData = { path: item.path, index: target.index };
        }
    }

    _onItemEnter(domEvt: any): void {
        const target = this.getTargetItem(domEvt.target);
        if (!target) return;

        const item = target.component as NavItemComponent;
        item.showTooltip();
    }

    _onItemLeave(domEvt: any): void {
        const target = this.getTargetItem(domEvt.target);
        if (!target) return;

        const item = target.component as NavItemComponent;
        item.hideTooltip();
    }

    _onCollapseToggle(): void {
        this.setMode(this.mode === 'expanded' ? 'collapsed' : 'expanded');
    }

    get defaultEventData(): Record<string, any> {
        return {
            ...super.defaultEventData,
            navMode: this.mode,
            activeIndex: this.activeIndex,
            maxDepth: this.maxDepth,
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
        const container = (this as any).itemContainer?.el as HTMLElement | undefined;
        if (container) container.classList.add('q-nav__items');

        if (!this.pathIndex) this._buildPathIndex(this.getData('items'));

        this.toggleCls('q-nav--collapsed', this.mode === 'collapsed');

        this._syncItemConfig();

        if (this.activeIndex >= 0) {
            this.selectAt(this.activeIndex, true);
        }
    }

    private _buildPathIndex(items?: Record<string, any>[]): void {
        this.pathIndex = {};
        if (!items?.length) return;
        for (let i = 0; i < items.length; i++) {
            const path = items[i]?.path;
            if (path) this.pathIndex[path] = i;
        }
    }

    _syncItemConfig(): void {
        for (let i = 0; i < this.count; i++) {
            const item = this.getAt(i) as NavItemComponent;
            item.update({
                maxDepth: this.maxDepth,
                mode: this.mode,
                overlayOptions: this.overlayOptions,
                overlayComponent: this.overlayComponent,
            });
        }
    }

    selectAt(index: number, silent: boolean = false): void {
        if (index < 0 || index >= this.count) return;
        if (index === this.activeIndex) return;

        if (this.activeIndex >= 0 && this.activeIndex < this.count) {
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

    setOverlayOptions(options: NavOverlayOptions): void {
        this.overlayOptions = options;
        for (let i = 0; i < this.count; i++) {
            const item = this.getAt(i) as NavItemComponent;
            item.update({ overlayOptions: options });
        }
    }

    onUpdated(props?: Record<string, any>): void {
        if (props?.activeIndex !== undefined) this.selectAt(props.activeIndex);
        if (props?.mode !== undefined) this.setMode(props.mode);
        if (props?.maxDepth !== undefined) this._syncItemConfig();
        if (props?.overlayOptions !== undefined) this.setOverlayOptions(props.overlayOptions);
    }
}

NavComponent.define(NavComponentDefs);

export { NavComponent };
export type NavComponentInstance = InstanceType<typeof NavComponent>;
