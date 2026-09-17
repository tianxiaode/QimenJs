/**
 * TabsComponent 标签页容器组件
 *
 * 包含 TabBar（标签栏）+ Content（内容区）。
 * TabBar 支持 4 个位置：top、bottom、left、right。
 * 通过监听 TabBar 的 select/close 事件管理内容切换。
 *
 * 模板节点：
 * - tabBar   — 标签栏容器（TabBarComponent 挂载点）
 * - content  — 内容区容器
 *
 * @example
 * ```ts
 * new TabsComponent({
 *     items: [
 *         { label: '首页', content: '<p>首页内容</p>' },
 *         { label: '设置', content: SettingsPanel, closable: true },
 *     ],
 *     selectedIndex: 0,
 *     position: 'top',
 * })
 * tabs.on('change', ({ index, item }) => { ... })
 * tabs.on('close', ({ index, item }) => { ... })
 * ```
 */

import { Component } from '@qimenjs/component-core';
import type { ListenItem } from '@qimenjs/component-core';
import type { TabBarPosition } from './TabBarComponent';
import { TabBarComponent } from './TabBarComponent';
import type { TemplateDecl } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { EventForwarder } from '@/component-core/engine';
import { RouteEventBus } from '@/events';
import type { EventContext } from '@/context';
import { TABS_TPL } from './tabs-tpl';
import './tabs.css';

/** 标签页项 */
export interface TabPaneItem {
    label: string;
    iconCls?: string;
    /** 内容：HTML 字符串、组件类、或模板声明 */
    content?: string | (new (props?: Record<string, any>) => any) | TemplateDecl;
    closable?: boolean;
    disabled?: boolean;
    /** 路由路径：配置后点击该 tab 会导航到此路径，路由变化时自动切换 */
    route?: string;
}

const TabsComponentDefs: Definitions = {
    options: {
        selectedIndex: 0,
        position: 'top',
        items: null,
    },
} as const;

class TabsComponent extends Component {
    static type = 'tabs';
    get tpl(): TemplateDecl {
        return TABS_TPL;
    }

    listens: ListenItem[] = [
        { node: 'tabBar', events: { select: 'onTabBarSelect', close: 'onTabBarClose' } },
        { route: 'router', events: { change: 'onRouteChange' } },
    ];

    private _tabBar: InstanceType<typeof TabBarComponent> | null = null;
    private _contentInstances: any[] = [];
    private _lastNavigatedPath: string | null = null;
    private _routeIndex: Record<string, number> = {};

    onAfterInit(): void {
        this._applyPosition();
        this._buildRouteIndex();

        const tabBar = this.getComponent('tabBar') as
            | InstanceType<typeof TabBarComponent>
            | undefined;
        this._tabBar = tabBar ?? null;
        if (this._tabBar) {
            this._tabBar.update({
                items: this.items.map((item: TabPaneItem) => ({
                    label: item.label,
                    iconCls: item.iconCls,
                    closable: item.closable,
                    disabled: item.disabled,
                })),
                selectedIndex: this.selectedIndex,
                position: this.position,
            });
        }

        this._renderContent();
        this._applyActive();
    }

    onTabBarSelect(ctx: any): void {
        const data = ctx?.data ?? {};
        const index = data.index ?? data.selectedIndex;
        if (index === undefined || index === this.selectedIndex) return;
        this.selectedIndex = index;
        this.emit('change', { index, item: this.items[index] });

        const item = this.items[index];
        if (item?.route) {
            this._lastNavigatedPath = item.route;
            EventForwarder.forward(this, { router: 'navigate' }, { path: item.route });
        }
    }

    onRouteChange(event: any): void {
        const path = event?.path;
        if (!path) return;
        if (path === this._lastNavigatedPath) {
            this._lastNavigatedPath = null;
            return;
        }
        const index = this._routeIndex[path];
        if (index !== undefined && index !== this.selectedIndex) {
            this.selectedIndex = index;
        }
    }

    routerEmit(ctx: EventContext): void {
        RouteEventBus.getInstance().routeEmit(ctx);
    }

    onTabBarClose(ctx: any): void {
        const data = ctx?.data ?? {};
        const index = data.index;
        if (index === undefined) return;
        this._closeTab(index);
    }

    _onSelectedIndexOptionChange(value: number): void {
        this._tabBar?.selectAt(value);
        this._applyActive();
    }

    _onPositionOptionChange(_value: TabBarPosition): void {
        this._applyPosition();
        this._tabBar?.update({ position: this.position });
    }

    private _applyPosition(): void {
        this.removeCls('q-tabs--top q-tabs--bottom q-tabs--left q-tabs--right');
        this.addCls(`q-tabs--${this.position}`);
    }

    private _buildRouteIndex(): void {
        this._routeIndex = {};
        for (let i = 0; i < this.items.length; i++) {
            const route = this.items[i]?.route;
            if (route) this._routeIndex[route] = i;
        }
    }

    private _closeTab(index: number): void {
        if (index < 0 || index >= this.items.length) return;

        const item = this.items[index];
        this.emit('close', { index, item });

        const contentInstance = this._contentInstances[index];
        if (contentInstance && typeof contentInstance.dispose === 'function') {
            contentInstance.dispose();
        }

        this.items.splice(index, 1);
        this._contentInstances.splice(index, 1);

        if (this.selectedIndex >= this.items.length) {
            this.selectedIndex = Math.max(0, this.items.length - 1);
        } else if (index < this.selectedIndex && this.selectedIndex > 0) {
            this.selectedIndex--;
        }

        this._renderContent();
        this._applyActive();
    }

    private _renderContent(): void {
        const contentEl = this.getNodeEl('content');
        if (!contentEl) return;

        for (const inst of this._contentInstances) {
            if (inst && typeof inst.dispose === 'function') inst.dispose();
        }
        contentEl.innerHTML = '';
        this._contentInstances = [];

        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            const pane = document.createElement('div');
            pane.className = 'q-tabs__pane';

            if (item.disabled) {
                pane.classList.add('q-tabs__pane--disabled');
            }

            const content = item.content;
            if (typeof content === 'string') {
                pane.innerHTML = content;
            } else if (typeof content === 'function') {
                const inst = new content({ container: pane });
                this._contentInstances.push(inst);
            } else if (
                content &&
                typeof content === 'object' &&
                ('tag' in content || 'children' in content)
            ) {
                const inst = this._createSlotComponent(content as TemplateDecl, pane);
                this._contentInstances.push(inst);
            }

            contentEl.appendChild(pane);
        }
    }

    private _applyActive(): void {
        const contentEl = this.getNodeEl('content');
        if (!contentEl) return;

        const panes = contentEl.children;
        for (let i = 0; i < panes.length; i++) {
            panes[i].classList.toggle('q-tabs__pane--active', i === this.selectedIndex);
        }
    }

    get tabBar(): InstanceType<typeof TabBarComponent> | null {
        return this._tabBar;
    }

    update(props?: Record<string, any>): void {
        if (props?.items !== undefined) {
            this.items = props.items;
            this._buildRouteIndex();
            this._tabBar?.update({
                items: this.items.map((i: TabPaneItem) => ({
                    label: i.label,
                    iconCls: i.iconCls,
                    closable: i.closable,
                    disabled: i.disabled,
                })),
            });
            this._renderContent();
            this._applyActive();
        }
        if (props?.selectedIndex !== undefined) {
            this.selectedIndex = props.selectedIndex;
        }
        if (props?.position !== undefined) {
            this.position = props.position;
        }
    }

    onBeforeDispose(): void {
        for (const instance of this._contentInstances) {
            if (instance && typeof instance.dispose === 'function') {
                instance.dispose();
            }
        }
        this._tabBar?.dispose?.();
    }
}

TabsComponent.define(TabsComponentDefs);

export { TabsComponent };
