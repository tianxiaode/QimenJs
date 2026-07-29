/**
 * TabsComponent 标签页组件
 *
 * 水平/垂直标签页，支持关闭、禁用、懒加载。
 * 数据驱动：通过 items 属性设置标签项。
 *
 * 模板节点：
 * - tabBar — 标签栏容器
 * - items  — 内容区容器
 *
 * @example
 * ```ts
 * new TabsComponent({
 *     items: [
 *         { label: '首页', content: '<p>首页内容</p>' },
 *         { label: '设置', content: SettingsPanel, closable: true },
 *         { label: '关于', disabled: true },
 *     ],
 *     activeIndex: 0,
 * })
 * tabs.on('change', ({ index, item }) => { ... })
 * tabs.on('close', ({ index, item }) => { ... })
 * tabs.direction = 'vertical';
 * ```
 */

import { Component, TemplateRegistrar } from '@qimenjs/component-core';
import { DOM_EVENT_PREFIX } from '@qimenjs/event-dom';
import { TabBarComponent } from '../tab-bar/TabBarComponent';

export interface TabItem {
    label: string;
    icon?: string;
    content?: string | (new (props?: Record<string, any>) => any);
    closable?: boolean;
    disabled?: boolean;
}

export interface TabsProps {
    items?: TabItem[];
    activeIndex?: number;
    direction?: 'horizontal' | 'vertical';
    closable?: boolean;
}

class TabsComponent extends Component {
    private _tabBar: InstanceType<typeof TabBarComponent> | null = null;
    private _tabItems: TabItem[] = [];
    private _activeIndex: number = 0;
    private _direction: 'horizontal' | 'vertical' = 'horizontal';
    private _closable: boolean = false;
    private _contentInstances: any[] = [];
    private _closeBtnEls: HTMLElement[] = [];
    private _clickBound: boolean = false;

    constructor(props?: TabsProps) {
        super();

        this._tabItems = props?.items ?? [];
        this._activeIndex = props?.activeIndex ?? 0;
        this._direction = props?.direction ?? 'horizontal';
        this._closable = props?.closable ?? false;

        if (this._direction === 'vertical') {
            (this.el as HTMLElement).classList.add('q-tabs--vertical');
        }

        this._tabBar = new TabBarComponent({
            items: this._tabItems.map((i: TabItem) => ({ text: i.label, icon: i.icon })),
            selectedIndex: this._activeIndex,
        });

        const barEl = this.nodeMap?.tabBar?.el;
        if (barEl) barEl.appendChild(this._tabBar.el);

        this._tabBar.on('select', ({ index }: any) => {
            if (this._tabItems[index]?.disabled) return;
            this._activeIndex = index;
            this._applyActive();
            this.emit('change', { index, item: this._tabItems[index] });
        });

        this._renderContent();
        this._renderCloseButtons();
        this._applyActive();
        this._bindCloseClick();
    }

    get activeIndex(): number {
        return this._activeIndex;
    }
    set activeIndex(value: number) {
        if (this._tabItems[value]?.disabled) return;
        this._activeIndex = value;
        this._tabBar?.selectAt(value);
        this._applyActive();
    }

    get tabBar(): InstanceType<typeof TabBarComponent> | null {
        return this._tabBar;
    }

    get tabItems(): readonly TabItem[] {
        return this._tabItems;
    }

    get direction(): 'horizontal' | 'vertical' {
        return this._direction;
    }
    set direction(value: 'horizontal' | 'vertical') {
        this._direction = value;
        (this.el as HTMLElement).classList.toggle('q-tabs--vertical', value === 'vertical');
    }

    get closable(): boolean {
        return this._closable;
    }
    set closable(value: boolean) {
        this._closable = value;
        this._renderCloseButtons();
    }

    _renderContent(): void {
        const contentEl = this.nodeMap?.items?.el;
        if (!contentEl) return;

        contentEl.innerHTML = '';
        this._contentInstances = [];

        for (let i = 0; i < this._tabItems.length; i++) {
            const item = this._tabItems[i];
            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'q-tabs__pane';
            contentWrapper.hidden = true;

            if (item.disabled) {
                contentWrapper.classList.add('q-tabs__pane--disabled');
            }

            if (item.content) {
                if (typeof item.content === 'string') {
                    if (item.content.startsWith('<')) {
                        contentWrapper.innerHTML = item.content;
                    } else {
                        const CompClass = TemplateRegistrar.getInstance().get(item.content) as any;
                        if (CompClass) {
                            const instance = new CompClass();
                            contentWrapper.appendChild(instance.el);
                            this._contentInstances.push(instance);
                        }
                    }
                } else {
                    const instance = new item.content();
                    contentWrapper.appendChild(instance.el);
                    this._contentInstances.push(instance);
                }
            }

            contentEl.appendChild(contentWrapper);
        }
    }

    _renderCloseButtons(): void {
        const barEl = this.nodeMap?.tabBar?.el as HTMLElement | null;
        if (!barEl) return;

        for (const btn of this._closeBtnEls) btn.remove();
        this._closeBtnEls = [];

        const toggleEls = barEl.querySelectorAll('.q-toggle');
        toggleEls.forEach((toggleEl, i) => {
            const item = this._tabItems[i];
            const showClose = this._closable || item?.closable;
            if (!showClose) return;

            const closeBtn = document.createElement('span');
            closeBtn.className = 'q-tabs__close';
            closeBtn.dataset.index = String(i);
            closeBtn.textContent = '×';
            (toggleEl as HTMLElement).appendChild(closeBtn);
            this._closeBtnEls.push(closeBtn);
        });
    }

    _bindCloseClick(): void {
        if (this._clickBound) return;
        const barEl = this.nodeMap?.tabBar?.el as HTMLElement | null;
        if (!barEl) return;

        this._clickBound = true;
        this.bind(barEl, 'click');
        this.on(`${DOM_EVENT_PREFIX}click`, (ctx: any) => {
            const target = ctx?.data?.originalEvent?.target as HTMLElement | null;
            const closeBtn = target?.closest('.q-tabs__close') as HTMLElement | null;
            if (!closeBtn) return;

            const index = Number(closeBtn.dataset?.index);
            if (isNaN(index) || index < 0 || index >= this._tabItems.length) return;

            const item = this._tabItems[index];
            this.emit('close', { index, item });

            this._tabItems.splice(index, 1);
            this._contentInstances.splice(index, 1)[0]?.dispose?.();

            if (this._tabBar) {
                this._tabBar.update({
                    items: this._tabItems.map((i: TabItem) => ({
                        text: i.label,
                        icon: i.icon,
                    })),
                });
            }

            this._renderContent();
            this._renderCloseButtons();

            if (this._activeIndex >= this._tabItems.length) {
                this._activeIndex = Math.max(0, this._tabItems.length - 1);
            } else if (index <= this._activeIndex && this._activeIndex > 0) {
                this._activeIndex--;
            }
            this._applyActive();
        });
    }

    _applyActive(): void {
        const contentEl = this.nodeMap?.items?.el;
        if (!contentEl) return;

        const panes = contentEl.children;
        for (let i = 0; i < panes.length; i++) {
            (panes[i] as HTMLElement).hidden = i !== this._activeIndex;
        }
    }

    update(props?: Partial<TabsProps>): void {
        if (props?.items !== undefined) {
            this._tabItems = props.items;
            this._renderContent();
            if (this._tabBar) {
                this._tabBar.update({
                    items: this._tabItems.map((i: TabItem) => ({
                        text: i.label,
                        icon: i.icon,
                    })),
                });
            }
            this._renderCloseButtons();
            this._applyActive();
        }
        if (props?.activeIndex !== undefined) {
            this.activeIndex = props.activeIndex;
        }
        if (props?.direction !== undefined) {
            this.direction = props.direction;
        }
        if (props?.closable !== undefined) {
            this.closable = props.closable;
        }
    }

    dispose(): void {
        for (const instance of this._contentInstances) {
            instance?.dispose?.();
        }
        this._tabBar?.dispose?.();
        super.dispose();
    }
}

export { TabsComponent };
export type TabsComponentInstance = InstanceType<typeof TabsComponent>;
