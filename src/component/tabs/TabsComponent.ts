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

import { Component, ComponentRegistrar } from '@qimenjs/component-core';
import type { TabBarPosition } from './TabBarComponent';
import { TabBarComponent } from './TabBarComponent';
import type { TabProps as TabItemProps } from './TabComponent';
import { TABS_TPL } from './tabs-tpl';

/** 标签页项 */
export interface TabPaneItem {
    label: string;
    icon?: string;
    /** 内容：HTML 字符串 或 组件类 */
    content?: string | (new (props?: Record<string, any>) => any);
    closable?: boolean;
    disabled?: boolean;
}

/** 标签页集属性接口 */
export interface TabsProps {
    items?: TabPaneItem[];
    selectedIndex?: number;
    position?: TabBarPosition;
}

class TabsComponent extends Component {
    private _tabBar: InstanceType<typeof TabBarComponent> | null = null;
    private _items: TabPaneItem[] = [];
    private _selectedIndex: number = 0;
    private _position: TabBarPosition = 'top';
    private _contentInstances: any[] = [];

    onAfterInit(props?: TabsProps): void {
        this._items = props?.items ?? [];
        this._selectedIndex = props?.selectedIndex ?? 0;
        this._position = props?.position ?? 'top';

        this._applyPosition();
        this._createTabBar();
        this._renderContent();
        this._applyActive();
    }

    private _applyPosition(): void {
        this.removeCls('q-tabs--top q-tabs--bottom q-tabs--left q-tabs--right');
        this.addCls(`q-tabs--${this._position}`);
    }

    private _createTabBar(): void {
        const barEl = this.nodeMap?.tabBar?.el;
        if (!barEl) return;

        this._tabBar = new TabBarComponent({
            items: this._items.map(item => ({
                label: item.label,
                icon: item.icon,
                closable: item.closable,
                disabled: item.disabled,
            })),
            selectedIndex: this._selectedIndex,
            position: this._position,
        });

        barEl.appendChild(this._tabBar.el);

        // 监听 TabBar 事件
        this._tabBar.on('select', ({ index }: any) => {
            this._selectedIndex = index;
            this._applyActive();
            this.emit('change', { index, item: this._items[index] });
        });

        this._tabBar.on('close', ({ index }: any) => {
            this._closeTab(index);
        });
    }

    private _closeTab(index: number): void {
        if (index < 0 || index >= this._items.length) return;

        const item = this._items[index];
        this.emit('close', { index, item });

        // 销毁内容实例
        const contentInstance = this._contentInstances[index];
        if (contentInstance && typeof contentInstance.dispose === 'function') {
            contentInstance.dispose();
        }

        this._items.splice(index, 1);
        this._contentInstances.splice(index, 1);

        // 更新 TabBar
        this._tabBar?.update({
            items: this._items.map(i => ({
                label: i.label,
                icon: i.icon,
                closable: i.closable,
                disabled: i.disabled,
            })),
        });

        // 调整 selectedIndex
        if (this._selectedIndex >= this._items.length) {
            this._selectedIndex = Math.max(0, this._items.length - 1);
        } else if (index < this._selectedIndex && this._selectedIndex > 0) {
            this._selectedIndex--;
        }

        this._renderContent();
        this._applyActive();
    }

    private _renderContent(): void {
        const contentEl = this.nodeMap?.content?.el;
        if (!contentEl) return;

        contentEl.innerHTML = '';
        this._contentInstances = [];

        for (let i = 0; i < this._items.length; i++) {
            const item = this._items[i];
            const pane = document.createElement('div');
            pane.className = 'q-tabs__pane';
            pane.hidden = true;

            if (item.disabled) {
                pane.classList.add('q-tabs__pane--disabled');
            }

            if (item.content) {
                if (typeof item.content === 'string') {
                    if (item.content.startsWith('<')) {
                        pane.innerHTML = item.content;
                    } else {
                        // 组件类型名（字符串）
                        const CompClass = ComponentRegistrar.getInstance().get(item.content) as any;
                        if (CompClass) {
                            const instance = new CompClass();
                            pane.appendChild(instance.el);
                            this._contentInstances.push(instance);
                        }
                    }
                } else {
                    // 组件类
                    const instance = new item.content();
                    pane.appendChild(instance.el);
                    this._contentInstances.push(instance);
                }
            }

            contentEl.appendChild(pane);
        }
    }

    private _applyActive(): void {
        const contentEl = this.nodeMap?.content?.el;
        if (!contentEl) return;

        const panes = contentEl.children;
        for (let i = 0; i < panes.length; i++) {
            (panes[i] as HTMLElement).hidden = i !== this._selectedIndex;
        }
    }

    get selectedIndex(): number {
        return this._selectedIndex;
    }
    set selectedIndex(v: number) {
        if (this._items[v]?.disabled) return;
        this._selectedIndex = v;
        this._tabBar?.selectAt(v);
        this._applyActive();
    }

    get position(): TabBarPosition {
        return this._position;
    }
    set position(v: TabBarPosition) {
        this._position = v;
        this._applyPosition();
        this._tabBar?.update({ position: v });
    }

    get tabBar(): InstanceType<typeof TabBarComponent> | null {
        return this._tabBar;
    }

    get items(): readonly TabPaneItem[] {
        return this._items;
    }

    update(props?: Partial<TabsProps>): void {
        if (props?.items !== undefined) {
            this._items = props.items;
            this._tabBar?.update({
                items: this._items.map(i => ({
                    label: i.label,
                    icon: i.icon,
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

TabsComponent.useTemplate(TABS_TPL);
export { TabsComponent };
/** 标签页集实例类型 */
export type TabsComponentInstance = InstanceType<typeof TabsComponent>;
