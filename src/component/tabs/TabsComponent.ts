/**
 * TabsComponent 标签页组件
 *
 * items 统一定义，label 驱动标签栏，content 驱动内容区。
 * content 支持三种形式：HTML 字符串、组件 type 名、组件类。
 *
 * 模板节点：
 * - tabBar — 标签栏容器
 * - content — 内容区容器
 *
 * @example
 * ```ts
 * new TabsComponent({
 *     items: [
 *         { label: '用户', content: '<div>用户列表</div>' },
 *         { label: '角色', content: 'RoleManager' },
 *         { label: '权限', content: PermissionPanel },
 *     ]
 * })
 *
 * tabs.on('change', ({ index }) => { ... })
 * ```
 */

import { TemplateComponent, ComponentRegistrar } from '@qimenjs/component-core';
import { ToggleComponent } from '../toggle/ToggleComponent';

export interface TabItem {
    label: string;
    icon?: string;
    content?: string | (new (props?: Record<string, any>) => any);
}

export interface TabsProps {
    items?: TabItem[];
    activeIndex?: number;
}

export let TabsComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'q-tabs',
        children: [
            { tag: 'div', name: 'tabBar', className: 'q-tabs__bar' },
            { tag: 'div', name: 'content', className: 'q-tabs__content' },
        ],
    },
    body: {
        type: 'Tabs',

        _items: [] as TabItem[],
        _activeIndex: 0,
        _tabButtons: [] as ToggleComponent[],
        _contentInstances: [] as any[],
        _contentEls: [] as HTMLElement[],

        _initTabs(props?: TabsProps): void {
            if (props?.items) {
                this._items = props.items;
                this._renderTabs();
            }
            if (props?.activeIndex !== undefined) {
                this._activeIndex = props.activeIndex;
            }
            this._applyActive();
        },

        get activeIndex(): number {
            return this._activeIndex;
        },
        set activeIndex(value: number) {
            this._activeIndex = value;
            this._applyActive();
        },

        get items(): readonly TabItem[] {
            return this._items;
        },

        _renderTabs(): void {
            const barEl = this.nodeMap?.tabBar?.el as HTMLElement | null;
            const contentEl = this.nodeMap?.content?.el as HTMLElement | null;
            if (!barEl || !contentEl) return;

            barEl.innerHTML = '';
            contentEl.innerHTML = '';
            this._tabButtons = [];
            this._contentInstances = [];
            this._contentEls = [];

            for (let i = 0; i < this._items.length; i++) {
                const item = this._items[i];

                // 标签按钮
                const btn = new ToggleComponent({
                    text: item.label,
                    icon: item.icon,
                });
                barEl.appendChild(btn.el);
                this._tabButtons.push(btn);

                const idx = i;
                btn.el.addEventListener('click', () => {
                    this._activeIndex = idx;
                    this._applyActive();
                    this.emit('change', { index: idx, item: this._items[idx] });
                });

                // 内容区
                const contentWrapper = document.createElement('div');
                contentWrapper.className = 'q-tabs__pane';
                contentWrapper.hidden = true;

                if (item.content) {
                    if (typeof item.content === 'string') {
                        if (item.content.startsWith('<')) {
                            contentWrapper.innerHTML = item.content;
                        } else {
                            const CompClass = ComponentRegistrar.getInstance().get(item.content);
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
                this._contentEls.push(contentWrapper);
            }
        },

        _applyActive(): void {
            for (let i = 0; i < this._tabButtons.length; i++) {
                const isActive = i === this._activeIndex;
                this._tabButtons[i].pressed = isActive;
                if (this._contentEls[i]) {
                    this._contentEls[i].hidden = !isActive;
                }
            }
        },

        update(props?: Partial<TabsProps>): void {
            if (props?.items !== undefined) {
                this._items = props.items;
                this._renderTabs();
            }
            if (props?.activeIndex !== undefined) {
                this.activeIndex = props.activeIndex;
            }
        },

        dispose(): void {
            for (const instance of this._contentInstances) {
                instance?.dispose?.();
            }
            for (const btn of this._tabButtons) {
                btn?.dispose?.();
            }
            (this.constructor as any).__proto__.dispose.call(this);
        },
    },
});

export type TabsComponent = InstanceType<typeof TabsComponent>;
