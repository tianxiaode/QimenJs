/**
 * ComponentsPage - 组件展示页
 *
 * 左侧导航栏列出所有组件，右侧显示组件使用示例。
 * 目前为框架占位，内容后续填充。
 */

import { Component } from '@qimenjs/component-core';

const COMPONENT_LIST = [
    { name: 'Button', group: '基础' },
    { name: 'Icon', group: '基础' },
    { name: 'Avatar', group: '基础' },
    { name: 'Badge', group: '基础' },
    { name: 'Tag', group: '基础' },
    { name: 'Alert', group: '反馈' },
    { name: 'Progress', group: '反馈' },
    { name: 'Spinner', group: '反馈' },
    { name: 'Input', group: '表单' },
    { name: 'PasswordInput', group: '表单' },
    { name: 'Toggle', group: '表单' },
    { name: 'ToggleIcon', group: '表单' },
    { name: 'Dropdown', group: '导航' },
    { name: 'Menu', group: '导航' },
    { name: 'Tabs', group: '导航' },
    { name: 'TabBar', group: '导航' },
    { name: 'Nav', group: '导航' },
    { name: 'Breadcrumb', group: '导航' },
    { name: 'Card', group: '数据展示' },
    { name: 'Panel', group: '数据展示' },
    { name: 'Header', group: '数据展示' },
    { name: 'ItemGroup', group: '数据展示' },
    { name: 'Toolbar', group: '数据展示' },
    { name: 'Hero', group: '数据展示' },
    { name: 'Divider', group: '布局' },
    { name: 'Spacer', group: '布局' },
    { name: 'Accordion', group: '布局' },
    { name: 'Overflow', group: '布局' },
    { name: 'Tips', group: '浮层' },
];

export let ComponentsPage = Component.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-components-page',
        children: [
            {
                name: 'sidebar',
                cls: 'q-components-page__sidebar',
            },
            {
                name: 'content',
                cls: 'q-components-page__content',
            },
        ],
    },
    body: {
        type: 'ComponentsPage',

        onInitState() {
            return {
                _groups: [] as string[],
                _activeComponent: '',
            };
        },

        onAfterInit(): void {
            this._buildSidebar();
            this._showPlaceholder();
        },

        _buildSidebar(): void {
            const sidebar = this.nodeMap.sidebar.el;
            sidebar.innerHTML = '';

            const groups: Record<string, typeof COMPONENT_LIST> = {};
            for (const comp of COMPONENT_LIST) {
                if (!groups[comp.group]) groups[comp.group] = [];
                groups[comp.group].push(comp);
            }

            for (const [group, items] of Object.entries(groups)) {
                const groupHeader = document.createElement('div');
                groupHeader.style.cssText = [
                    'padding: 12px 16px 4px',
                    'font-size: 11px',
                    'font-weight: 600',
                    'color: var(--q-demo-text-secondary)',
                    'text-transform: uppercase',
                    'letter-spacing: 0.5px',
                ].join(';');
                groupHeader.textContent = group;
                sidebar.appendChild(groupHeader);

                for (const item of items) {
                    const btn = document.createElement('button');
                    btn.style.cssText = [
                        'width: 100%',
                        'padding: 8px 16px',
                        'border: none',
                        'background: transparent',
                        'cursor: pointer',
                        'font-size: 13px',
                        'color: var(--q-demo-text)',
                        'text-align: left',
                        'border-left: 3px solid transparent',
                        'transition: all 0.15s',
                    ].join(';');
                    btn.textContent = item.name;
                    btn.addEventListener('click', () => {
                        this._selectComponent(item.name, btn);
                    });
                    sidebar.appendChild(btn);
                }
            }
        },

        _selectComponent(name: string, btn: HTMLElement): void {
            this._activeComponent = name;

            const sidebar = this.nodeMap.sidebar.el;
            const allBtns = sidebar.querySelectorAll('button');
            allBtns.forEach((b: HTMLElement) => {
                b.style.backgroundColor = 'transparent';
                b.style.borderLeftColor = 'transparent';
            });
            btn.style.backgroundColor = 'var(--q-colors-primary, #1890ff)15';
            btn.style.borderLeftColor = 'var(--q-colors-primary, #1890ff)';

            this._showComponentDemo(name);
        },

        _showPlaceholder(): void {
            const content = this.nodeMap.content.el;
            content.innerHTML = `
                <div style="display:flex;flex-direction:column;gap:12px;">
                    <h2 style="font-size:20px;font-weight:600;">组件展示</h2>
                    <p style="color:var(--q-demo-text-secondary);">
                        从左侧选择一个组件查看其使用方式和功能展示。
                    </p>
                    <div style="margin-top:24px;padding:24px;border:1px dashed var(--q-demo-border);border-radius:8px;color:var(--q-demo-text-secondary);text-align:center;">
                        <i class="fa-solid fa-hand-pointer" style="font-size:32px;margin-bottom:12px;"></i>
                        <div>选择左侧组件开始探索</div>
                    </div>
                </div>
            `;
        },

        _showComponentDemo(name: string): void {
            const content = this.nodeMap.content.el;
            content.innerHTML = `
                <div style="display:flex;flex-direction:column;gap:16px;">
                    <h2 style="font-size:20px;font-weight:600;">${name}</h2>
                    <div style="padding:24px;border:1px solid var(--q-demo-border);border-radius:8px;background:#fff;min-height:200px;">
                        <div style="color:var(--q-demo-text-secondary);text-align:center;padding:48px 0;">
                            <i class="fa-solid fa-person-digging" style="font-size:40px;margin-bottom:12px;"></i>
                            <div style="font-size:14px;">${name} 组件演示区域 — 内容待填充</div>
                        </div>
                    </div>
                    <div style="padding:16px;border:1px solid var(--q-demo-border);border-radius:8px;background:#fff;">
                        <div style="font-size:13px;font-weight:600;margin-bottom:8px;">基础用法</div>
                        <pre style="background:#f5f5f5;padding:12px;border-radius:4px;font-size:12px;overflow-x:auto;"><code>import { ${name}Component } from '@qimenjs/component';

const comp = new ${name}Component({ /* props */ });
document.getElementById('app').appendChild(comp.el);</code></pre>
                    </div>
                </div>
            `;
        },
    },
});

export type ComponentsPage = InstanceType<typeof ComponentsPage>;