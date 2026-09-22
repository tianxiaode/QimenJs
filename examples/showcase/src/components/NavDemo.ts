import {
    Component,
    type TemplateDecl,
    type ListenItem,
    DomEventsMap,
} from '@qimenjs/component-core';
import type { DemoConfig, DemoSection } from './types';

/** Nav 选中项交互演示 */
class NavSelectDemo extends Component {
    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            style: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
            children: [
                {
                    type: 'nav',
                    name: 'nav',
                    options: {
                        activeIndex: 0,
                        items: [
                            { text: '首页', iconCls: 'fa-solid fa-house' },
                            { text: '搜索', iconCls: 'fa-solid fa-magnifying-glass' },
                            { text: '消息', iconCls: 'fa-solid fa-bell' },
                            { text: '设置', iconCls: 'fa-solid fa-gear' },
                        ],
                    },
                },
                {
                    tag: 'div',
                    name: 'result',
                    classes: 'q-demo__hint',
                    options: { text: '点击导航项查看效果' },
                },
            ],
        };
    }

    listens: ListenItem[] = [{ node: 'nav', events: { select: { handler: '_onNavSelect' } } }];

    _onNavSelect(ctx: any): void {
        const data = ctx?.data ?? {};
        const index = data?.index;
        const result = this.getNodeEl('result');
        if (result && index !== undefined) {
            result.textContent = `选中导航项: index=${index}`;
        }
    }
}

/** 外部按钮控制折叠演示 */
class NavToggleDemo extends Component {
    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            style: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
            children: [
                {
                    type: 'nav',
                    name: 'nav',
                    options: {
                        activeIndex: 0,
                        items: [
                            { text: '首页', iconCls: 'fa-solid fa-house' },
                            { text: '搜索', iconCls: 'fa-solid fa-magnifying-glass' },
                            { text: '消息', iconCls: 'fa-solid fa-bell' },
                            { text: '设置', iconCls: 'fa-solid fa-gear' },
                        ],
                    },
                },
                {
                    type: 'button',
                    name: 'toggleBtn',
                    options: {
                        text: '折叠',
                        variant: 'outline',
                        size: 'sm',
                    },
                },
            ],
        };
    }

    domEvents?: DomEventsMap | undefined = {
        click: {
            path: 'toggleBtn',
            handler: '_onToggleClick',
        },
    };

    _onToggleClick(): void {
        const nav = this.getComponent('nav') as any;
        if (!nav) return;
        const newMode = nav.mode === 'expanded' ? 'collapsed' : 'expanded';
        nav.update({ mode: newMode });
        const btn = this.getComponent('toggleBtn') as any;
        if (btn) btn.update({ text: newMode === 'collapsed' ? '展开' : '折叠' });
    }
}

export const NAV_DEMO: DemoConfig = {
    title: 'Nav',
    description: '导航项组组件，支持 expanded/collapsed 模式、图标、路由导航、嵌套浮层',
    sections: [
        {
            label: '基本导航',
            code: `{
    type: 'nav',
    options: {
        activeIndex: 0,
        items: [
            { text: '首页' },
            { text: '搜索' },
            { text: '消息' },
            { text: '设置' },
        ],
    }
}`,
            template: {
                type: 'nav',
                options: {
                    activeIndex: 0,
                    items: [{ text: '首页' }, { text: '搜索' }, { text: '消息' }, { text: '设置' }],
                },
            },
        },
        {
            label: '带图标',
            code: `{
    type: 'nav',
    options: {
        activeIndex: 0,
        items: [
            { text: '首页', iconCls: 'fa-solid fa-house' },
            { text: '搜索', iconCls: 'fa-solid fa-magnifying-glass' },
            { text: '消息', iconCls: 'fa-solid fa-bell' },
        ],
    }
}`,
            template: {
                type: 'nav',
                options: {
                    activeIndex: 0,
                    items: [
                        { text: '首页', iconCls: 'fa-solid fa-house' },
                        { text: '搜索', iconCls: 'fa-solid fa-magnifying-glass' },
                        { text: '消息', iconCls: 'fa-solid fa-bell' },
                    ],
                },
            },
        },
        {
            label: '折叠模式 (collapsed)',
            code: `{
    type: 'nav',
    options: {
        mode: 'collapsed',
        activeIndex: 0,
        items: [
            { text: '首页', iconCls: 'fa-solid fa-house' },
            { text: '搜索', iconCls: 'fa-solid fa-magnifying-glass' },
        ],
    }
}`,
            template: {
                type: 'nav',
                options: {
                    mode: 'collapsed',
                    activeIndex: 0,
                    items: [
                        { text: '首页', iconCls: 'fa-solid fa-house' },
                        { text: '搜索', iconCls: 'fa-solid fa-magnifying-glass' },
                        { text: '消息', iconCls: 'fa-solid fa-bell' },
                        { text: '设置', iconCls: 'fa-solid fa-gear' },
                    ],
                },
            },
        },
        {
            label: '自带折叠按钮',
            code: `{
    type: 'nav',
    options: {
        showToggle: true,
        activeIndex: 0,
        items: [
            { text: '首页', iconCls: 'fa-solid fa-house' },
            { text: '搜索', iconCls: 'fa-solid fa-magnifying-glass' },
            { text: '消息', iconCls: 'fa-solid fa-bell' },
            { text: '设置', iconCls: 'fa-solid fa-gear' },
        ],
    }
}`,
            template: {
                type: 'nav',
                options: {
                    showToggle: true,
                    activeIndex: 0,
                    items: [
                        { text: '首页', iconCls: 'fa-solid fa-house' },
                        { text: '搜索', iconCls: 'fa-solid fa-magnifying-glass' },
                        { text: '消息', iconCls: 'fa-solid fa-bell' },
                        { text: '设置', iconCls: 'fa-solid fa-gear' },
                    ],
                },
            },
        },
        {
            label: '外部按钮控制折叠',
            code: `// 通过 update({ mode }) 切换 expanded/collapsed
const nav = instance.getComponent('nav');
nav.update({ mode: 'collapsed' });`,
            component: NavToggleDemo,
        },
        {
            label: '嵌套子菜单',
            code: `{
    type: 'nav',
    options: {
        activeIndex: 0,
        items: [
            { text: '组件', iconCls: 'fa-solid fa-cube', popover: {
                type: 'nav', trigger: 'hover', placement: 'right-start',
                options: { items: [
                    { text: 'Button', href: '/components/Button' },
                    { text: 'Card', href: '/components/Card' },
                ]}
            }},
            { text: '布局', iconCls: 'fa-solid fa-table-cells', popover: {
                type: 'nav', trigger: 'hover', placement: 'right-start',
                options: { items: [
                    { text: 'Panel', href: '/components/Panel' },
                    { text: 'Tabs', href: '/components/Tabs' },
                ]}
            }},
            { text: '设置', iconCls: 'fa-solid fa-gear' },
        ],
    }
}`,
            template: {
                type: 'nav',
                options: {
                    activeIndex: 0,
                    items: [
                        {
                            text: '组件',
                            iconCls: 'fa-solid fa-cube',
                            popover: {
                                type: 'nav',
                                trigger: 'hover',
                                placement: 'right-start',
                                options: {
                                    items: [
                                        { text: 'Button', href: '/components/Button' },
                                        { text: 'Card', href: '/components/Card' },
                                    ],
                                },
                            },
                        },
                        {
                            text: '布局',
                            iconCls: 'fa-solid fa-table-cells',
                            popover: {
                                type: 'nav',
                                trigger: 'hover',
                                placement: 'right-start',
                                options: {
                                    items: [
                                        { text: 'Panel', href: '/components/Panel' },
                                        { text: 'Tabs', href: '/components/Tabs' },
                                    ],
                                },
                            },
                        },
                        { text: '设置', iconCls: 'fa-solid fa-gear' },
                    ],
                },
            },
        },
        {
            label: '选中项交互',
            code: `// select 事件中通过 data.index 获取选中项索引
nav.on('select', (data) => {
    console.log(data.index);
})`,
            component: NavSelectDemo,
        } satisfies DemoSection,
    ],
};
