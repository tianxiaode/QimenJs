import type { DemoConfig } from './types';
import { Component, type TemplateDecl } from '@qimenjs/component-core';
import { TabsComponent, type TabPaneItem } from '@/component/tabs/TabsComponent';
import { TabBarComponent } from '@/component/tabs/TabBarComponent';

const DYNAMIC_TABS_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-demo__row',
    style: { flexDirection: 'column', gap: '8px' },
    children: [
        {
            tag: 'div',
            style: { display: 'flex', gap: '8px' },
            children: [
                {
                    tag: 'button',
                    name: 'addBtn',
                    classes: 'q-demo__btn',
                    options: { text: '+ 添加标签' },
                },
                {
                    tag: 'button',
                    name: 'removeBtn',
                    classes: 'q-demo__btn',
                    options: { text: '- 移除当前' },
                },
            ],
        },
        {
            type: 'tabs',
            name: 'tabs',
            options: {
                selectedIndex: 0,
                items: [
                    { label: 'Tab 1', content: '<p>标签 1 内容</p>' },
                    { label: 'Tab 2', content: '<p>标签 2 内容</p>' },
                ],
            },
        },
    ],
};

class DynamicTabsDemo extends Component {
    static type = 'dynamic-tabs-demo';
    get tpl(): TemplateDecl {
        return DYNAMIC_TABS_TPL;
    }

    private _tabCounter: number = 3;
    private _tabs: TabsComponent | null = null;

    domEvents = {
        click: [
            { path: 'addBtn', handler: '_onAddClick' },
            { path: 'removeBtn', handler: '_onRemoveClick' },
        ],
    };

    onAfterInit(): void {
        this._tabs = this.getComponent('tabs') as TabsComponent;
    }

    _onAddClick(): void {
        if (!this._tabs) return;
        const label = `Tab ${this._tabCounter++}`;
        this._tabs.addTab({ label, content: `<p>${label} 内容</p>` });
    }

    _onRemoveClick(): void {
        if (!this._tabs) return;
        const idx = this._tabs.selectedIndex;
        if (this._tabs.items.length > 1) {
            this._tabs.removeTab(idx);
        }
    }
}

const OVERFLOW_SWITCH_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-demo__row',
    style: { flexDirection: 'column', gap: '8px' },
    children: [
        {
            tag: 'div',
            style: { display: 'flex', gap: '8px' },
            children: [
                {
                    tag: 'button',
                    name: 'scrollBtn',
                    classes: 'q-demo__btn',
                    options: { text: 'scroll 模式' },
                },
                {
                    tag: 'button',
                    name: 'menuBtn',
                    classes: 'q-demo__btn',
                    options: { text: 'menu 模式' },
                },
                {
                    tag: 'button',
                    name: 'noneBtn',
                    classes: 'q-demo__btn',
                    options: { text: 'none (关闭溢出)' },
                },
            ],
        },
        {
            type: 'tab-bar',
            name: 'tabBar',
            options: {
                overflowMode: 'scroll',
                selectedIndex: 0,
                items: [
                    { label: 'Tab 1' },
                    { label: 'Tab 2' },
                    { label: 'Tab 3' },
                    { label: 'Tab 4' },
                    { label: 'Tab 5' },
                    { label: 'Tab 6' },
                    { label: 'Tab 7' },
                    { label: 'Tab 8' },
                ],
            },
            style: { maxWidth: '400px' },
        },
    ],
};

class OverflowSwitchDemo extends Component {
    static type = 'overflow-switch-demo';
    get tpl(): TemplateDecl {
        return OVERFLOW_SWITCH_TPL;
    }

    private _tabBar: TabBarComponent | null = null;

    domEvents = {
        click: [
            { path: 'scrollBtn', handler: '_onScrollClick' },
            { path: 'menuBtn', handler: '_onMenuClick' },
            { path: 'noneBtn', handler: '_onNoneClick' },
        ],
    };

    onAfterInit(): void {
        this._tabBar = this.getComponent('tabBar') as TabBarComponent;
    }

    _onScrollClick(): void {
        this._tabBar?.update({ overflowMode: 'scroll' });
    }

    _onMenuClick(): void {
        this._tabBar?.update({ overflowMode: 'menu' });
    }

    _onNoneClick(): void {
        this._tabBar?.update({ overflowMode: 'none' });
    }
}

export const TABS_DEMO: DemoConfig = {
    title: 'Tabs',
    description:
        '标签栏/标签页组件，支持 position(top/bottom/left/right) + selectedIndex + size + content(字符串/组件/模板)',
    sections: [
        {
            label: '基础标签栏 (top)',
            code: `{ type: 'tab-bar', options: {
    position: 'top',
    selectedIndex: 0,
    items: [{ label: '首页' }, { label: '设置' }, { label: '关于' }],
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'tab-bar',
                        options: {
                            position: 'top',
                            selectedIndex: 0,
                            items: [{ label: '首页' }, { label: '设置' }, { label: '关于' }],
                        },
                    },
                ],
            },
        },
        {
            label: '带图标 (iconCls)',
            code: `{ type: 'tab-bar', options: {
    items: [{ label: '首页', iconCls: 'fa fa-home' }, { label: '设置', iconCls: 'fa fa-cog' }, { label: '搜索', iconCls: 'fa fa-search' }],
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'tab-bar',
                        options: {
                            selectedIndex: 0,
                            items: [
                                { label: '首页', iconCls: 'fa fa-home' },
                                { label: '设置', iconCls: 'fa fa-cog' },
                                { label: '搜索', iconCls: 'fa fa-search' },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '可关闭标签 (closable)',
            code: `{ type: 'tab-bar', options: {
    items: [{ label: '首页' }, { label: '编辑', closable: true }, { label: '预览', closable: true }],
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'tab-bar',
                        options: {
                            selectedIndex: 0,
                            items: [
                                { label: '首页' },
                                { label: '编辑', closable: true },
                                { label: '预览', closable: true },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '动态增删标签 (addTab/removeTab)',
            code: `tabs.addTab({ label: '新标签', content: '<p>新标签内容</p>' })
tabs.removeTab(0)`,
            component: DynamicTabsDemo,
        },
        {
            label: '尺寸 (size)',
            code: `{ type: 'tab-bar', options: {
    size: 'sm',
    items: [{ label: '小' }, { label: '标签' }],
} }
{ type: 'tab-bar', options: {
    size: 'lg',
    items: [{ label: '大' }, { label: '标签' }],
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'tab-bar',
                        options: {
                            size: 'sm',
                            selectedIndex: 0,
                            items: [{ label: '小' }, { label: '标签' }],
                        },
                    },
                    {
                        type: 'tab-bar',
                        options: {
                            size: 'lg',
                            selectedIndex: 0,
                            items: [{ label: '大' }, { label: '标签' }],
                        },
                    },
                ],
            },
        },
        {
            label: '标签页内容 (tabs + content)',
            code: `{ type: 'tabs', options: {
    selectedIndex: 0,
    items: [
        { label: '首页', content: '<p>首页内容区域</p>' },
        { label: '设置', content: '<p>设置内容区域</p>' },
    ],
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'tabs',
                        options: {
                            selectedIndex: 0,
                            items: [
                                { label: '首页', content: '<p>首页内容区域</p>' },
                                { label: '设置', content: '<p>设置内容区域</p>' },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '路由切换 (route)',
            code: `{ type: 'tabs', options: {
    selectedIndex: 0,
    items: [
        { label: '首页', route: '/components/Tabs/home', content: '<p>首页 - 路由 /components/Tabs/home</p>' },
        { label: '设置', route: '/components/Tabs/settings', content: '<p>设置 - 路由 /components/Tabs/settings</p>' },
        { label: '关于', content: '<p>关于 - 无路由，纯事件切换</p>' },
    ],
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'tabs',
                        options: {
                            selectedIndex: 0,
                            items: [
                                { label: '首页', route: '/components/Tabs/home', content: '<p>首页 - 路由 /components/Tabs/home</p>' },
                                { label: '设置', route: '/components/Tabs/settings', content: '<p>设置 - 路由 /components/Tabs/settings</p>' },
                                { label: '关于', content: '<p>关于 - 无路由，纯事件切换</p>' },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '底部位置 (bottom)',
            code: `{ type: 'tab-bar', options: { position: 'bottom', items: [{ label: 'A' }, { label: 'B' }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'tab-bar',
                        options: {
                            position: 'bottom',
                            selectedIndex: 0,
                            items: [{ label: 'A' }, { label: 'B' }],
                        },
                    },
                ],
            },
        },
        {
            label: '左侧位置 (left)',
            code: `{ type: 'tabs', options: { position: 'left', items: [{ label: 'A', content: '<p>A</p>' }, { label: 'B', content: '<p>B</p>' }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'tabs',
                        options: {
                            position: 'left',
                            selectedIndex: 0,
                            items: [
                                { label: 'A', content: '<p>左侧 A 内容</p>' },
                                { label: 'B', content: '<p>左侧 B 内容</p>' },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '右侧位置 (right)',
            code: `{ type: 'tabs', options: { position: 'right', items: [{ label: 'A', content: '<p>A</p>' }, { label: 'B', content: '<p>B</p>' }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'tabs',
                        options: {
                            position: 'right',
                            selectedIndex: 0,
                            items: [
                                { label: 'A', content: '<p>右侧 A 内容</p>' },
                                { label: 'B', content: '<p>右侧 B 内容</p>' },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '溢出模式 - scroll (滚动8标签)',
            code: `{ type: 'tab-bar', options: {
    overflowMode: 'scroll',
    items: [{ label: 'Tab 1' }, ..., { label: 'Tab 8' }],
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                style: { maxWidth: '400px' },
                children: [
                    {
                        type: 'tab-bar',
                        options: {
                            overflowMode: 'scroll',
                            selectedIndex: 0,
                            items: [
                                { label: 'Tab 1' },
                                { label: 'Tab 2' },
                                { label: 'Tab 3' },
                                { label: 'Tab 4' },
                                { label: 'Tab 5' },
                                { label: 'Tab 6' },
                                { label: 'Tab 7' },
                                { label: 'Tab 8' },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '溢出模式 - menu (8标签)',
            code: `{ type: 'tab-bar', options: {
    overflowMode: 'menu',
    items: [{ label: 'Tab 1' }, ..., { label: 'Tab 8' }],
} }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                style: { maxWidth: '400px' },
                children: [
                    {
                        type: 'tab-bar',
                        options: {
                            overflowMode: 'menu',
                            selectedIndex: 0,
                            items: [
                                { label: 'Tab 1' },
                                { label: 'Tab 2' },
                                { label: 'Tab 3' },
                                { label: 'Tab 4' },
                                { label: 'Tab 5' },
                                { label: 'Tab 6' },
                                { label: 'Tab 7' },
                                { label: 'Tab 8' },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '动态切换溢出模式',
            code: `tabBar.overflowMode = 'menu'  // 切换为菜单模式
tabBar.overflowMode = 'scroll' // 切换为滚动模式
tabBar.overflowMode = 'none'   // 关闭溢出`,
            component: OverflowSwitchDemo,
        },
    ],
};
