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
import type { TabBarPosition } from './TabBarComponent';
import { TabBarComponent } from './TabBarComponent';
import type { TemplateDecl } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { TABS_TPL } from './tabs-tpl';
import './tabs.css';

/** 标签页项 */
export interface TabPaneItem {
    label: string;
    icon?: string;
    /** 内容：HTML 字符串 或 组件类 */
    content?: string | (new (props?: Record<string, any>) => any);
    closable?: boolean;
    disabled?: boolean;
}

const TabsComponentDefs: Definitions = {
    options: {
        selectedIndex: 0,
        position: 'top',
    },
    fields: {
        items: [],
    },
} as const;

class TabsComponent extends Component {
    get tpl(): TemplateDecl {
        return TABS_TPL;
    }
    private _tabBar: InstanceType<typeof TabBarComponent> | null = null;
    private _contentInstances: any[] = [];

    onAfterInit(): void {
        this._applyPosition();
        this._createTabBar();
        this._renderContent();
        this._applyActive();
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

    private _createTabBar(): void {
        const barEl = this.nodeMap?.tabBar?.el;
        if (!barEl) return;

        this._tabBar = new TabBarComponent({
            items: this.items.map(item => ({
                label: item.label,
                icon: item.icon,
                closable: item.closable,
                disabled: item.disabled,
            })),
            selectedIndex: this.selectedIndex,
            position: this.position,
        });

        barEl.appendChild(this._tabBar.el);

        // 监听 TabBar 事件
        this._tabBar.on('select', ({ index }: any) => {
            this.selectedIndex = index;
            this.emit('change', { index, item: this.items[index] });
        });

        this._tabBar.on('close', ({ index }: any) => {
            this._closeTab(index);
        });
    }

    private _closeTab(index: number): void {
        if (index < 0 || index >= this.items.length) return;

        const item = this.items[index];
        this.emit('close', { index, item });

        // 销毁内容实例
        const contentInstance = this._contentInstances[index];
        if (contentInstance && typeof contentInstance.dispose === 'function') {
            contentInstance.dispose();
        }

        this.items.splice(index, 1);
        this._contentInstances.splice(index, 1);

        // 更新 TabBar
        this._tabBar?.update({
            items: this.items.map(i => ({
                label: i.label,
                icon: i.icon,
                closable: i.closable,
                disabled: i.disabled,
            })),
        });

        // 调整 selectedIndex
        if (this.selectedIndex >= this.items.length) {
            this.selectedIndex = Math.max(0, this.items.length - 1);
        } else if (index < this.selectedIndex && this.selectedIndex > 0) {
            this.selectedIndex--;
        }

        this._renderContent();
        this._applyActive();
    }

    private _renderContent(): void {
        const contentEl = this.nodeMap?.content?.el;
        if (!contentEl) return;

        contentEl.innerHTML = '';
        this._contentInstances = [];

        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
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
            (panes[i] as HTMLElement).hidden = i !== this.selectedIndex;
        }
    }

    get tabBar(): InstanceType<typeof TabBarComponent> | null {
        return this._tabBar;
    }

    update(props?: Record<string, any>): void {
        if (props?.items !== undefined) {
            this.items = props.items;
            this._tabBar?.update({
                items: this.items.map(i => ({
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

TabsComponent.define(TabsComponentDefs);

export { TabsComponent };
/** 标签页集实例类型 */
export type TabsComponentInstance = InstanceType<typeof TabsComponent>;
