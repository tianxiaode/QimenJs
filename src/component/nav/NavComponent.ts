/**
 * NavItemGroupComponent 导航项组组件
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
import type { ItemGroupProps } from '../itemgroup/ItemGroupBaseComponent';
import type { NavItemComponent, NavOverlayOptions } from './NavItemComponent';
import { DomEventsMap } from '@qimenjs/component-core';
import { RouteEventBus } from '@/events/RouteEventBus';
import type { EventContext } from '@/context';

export interface NavItemGroupProps extends ItemGroupProps {
    activeIndex?: number;
    mode?: 'expanded' | 'collapsed';
    maxDepth?: number;
    overlayOptions?: NavOverlayOptions;
    overlayComponent?: any;
    pathIndex?: Record<string, number>;
    indexPath?: string[];
}

class NavComponent extends ItemGroupPooledComponent {
    _activeIndex: number = -1;
    _navMode: 'expanded' | 'collapsed' = 'expanded';
    _maxDepth: number = 3;
    _overlayOptions: NavOverlayOptions | undefined = undefined;
    _overlayComponent: any = undefined;
    _pathIndex: Record<string, number> = {};
    _indexPath: string[] = [];
    _lastNavigatedPath: string | null = null;
    _pendingNavData: { path: string; index: number } | null = null;

    domEvents?: DomEventsMap | undefined = {
        click: {
            'NavItem.content': {
                handler: '_onItemClick',
                emits: ['[action]'],
                router: 'navigate',
            },
        },
        mouseenter: {
            NavItem: { handler: '_onItemEnter' },
        },
        mouseleave: {
            NavItem: { handler: '_onItemLeave' },
        },
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
            this._pendingNavData = { path: item.path, index: target.index };
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

    getCustomEventData(): any {
        const data = this._pendingNavData;
        this._pendingNavData = null;
        return data ?? {};
    }

    onRouteChange(event: any): void {
        const path = event?.path;
        if (!path) return;
        if (path === this._lastNavigatedPath) {
            this._lastNavigatedPath = null;
            return;
        }
        const index = this._pathIndex[path];
        if (index !== undefined) this.selectAt(index);
    }

    onAfterInit(props?: NavItemGroupProps & Record<string, any>): void {
        super.onAfterInit({ defaultItemType: 'NavItem', ...props });

        this.addCls('q-nav');
        const container = (this as any).itemContainer?.el as HTMLElement | undefined;
        if (container) container.classList.add('q-nav__items');

        this._navMode = props?.mode ?? 'expanded';
        this._maxDepth = props?.maxDepth ?? 3;
        this._overlayOptions = props?.overlayOptions;
        this._overlayComponent = props?.overlayComponent;

        if (props?.pathIndex) this._pathIndex = props.pathIndex;
        else this._buildPathIndex(props?.items);
        if (props?.indexPath) this._indexPath = props.indexPath;

        this.toggleCls('q-nav--collapsed', this._navMode === 'collapsed');

        this._syncItemConfig();

        if (props?.activeIndex !== undefined && props.activeIndex >= 0) {
            this.selectAt(props.activeIndex, true);
        }
    }

    private _buildPathIndex(items?: Record<string, any>[]): void {
        this._pathIndex = {};
        if (!items?.length) return;
        for (let i = 0; i < items.length; i++) {
            const path = items[i]?.path;
            if (path) this._pathIndex[path] = i;
        }
    }

    _syncItemConfig(): void {
        for (let i = 0; i < this.count; i++) {
            const item = this.getAt(i) as NavItemComponent;
            item.update({
                maxDepth: this._maxDepth,
                mode: this._navMode,
                overlayOptions: this._overlayOptions,
                overlayComponent: this._overlayComponent,
            });
        }
    }

    get activeIndex(): number {
        return this._activeIndex;
    }
    get mode(): 'expanded' | 'collapsed' {
        return this._navMode;
    }
    get maxDepth(): number {
        return this._maxDepth;
    }

    selectAt(index: number, silent: boolean = false): void {
        if (index < 0 || index >= this.count) return;
        if (index === this._activeIndex) return;

        if (this._activeIndex >= 0 && this._activeIndex < this.count) {
            const prevItem = this.getAt(this._activeIndex) as NavItemComponent;
            prevItem.setActive(false);
        }

        const newItem = this.getAt(index) as NavItemComponent;
        newItem.setActive(true);
        this._activeIndex = index;

        if (!silent) {
            this.emit('select', { index });
        }
    }

    clearSelection(): void {
        if (this._activeIndex >= 0 && this._activeIndex < this.count) {
            const item = this.getAt(this._activeIndex) as NavItemComponent;
            item.setActive(false);
        }
        this._activeIndex = -1;
    }

    setMode(value: 'expanded' | 'collapsed'): void {
        this._navMode = value;
        this.toggleCls('q-nav--collapsed', value === 'collapsed');

        for (let i = 0; i < this.count; i++) {
            const item = this.getAt(i) as NavItemComponent;
            item.setMode(value);
        }
    }

    setOverlayOptions(options: NavOverlayOptions): void {
        this._overlayOptions = options;
        for (let i = 0; i < this.count; i++) {
            const item = this.getAt(i) as NavItemComponent;
            item.update({ overlayOptions: options });
        }
    }

    onUpdated(props?: Record<string, any>): void {
        if (props?.activeIndex !== undefined) this.selectAt(props.activeIndex);
        if (props?.mode !== undefined) this.setMode(props.mode);
        if (props?.maxDepth !== undefined) {
            this._maxDepth = props.maxDepth;
            this._syncItemConfig();
        }
        if (props?.overlayOptions !== undefined) this.setOverlayOptions(props.overlayOptions);
        if (props?.pathIndex !== undefined) this._pathIndex = props.pathIndex;
        if (props?.indexPath !== undefined) this._indexPath = props.indexPath;
    }
}

NavComponent.register();
export { NavComponent };
export type NavComponentInstance = InstanceType<typeof NavComponent>;
