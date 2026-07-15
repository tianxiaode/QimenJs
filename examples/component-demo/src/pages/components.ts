/**
 * 组件展示页 — 展示 QimenJS 各组件效果
 *
 * 展示：Button、Badge、Tips、Menu、Toolbar、Nav 等
 */

import { TemplateComponent } from '@qimenjs/component-core';

export class ComponentsPage extends TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'components-page',
        children: [
            { tag: 'h2', className: 'page-title', children: [
                { tag: 'i', className: 'fa-solid fa-cubes' },
                { tag: 'span', content: ' 组件展示' },
            ]},

            // Button 区域
            { tag: 'section', className: 'comp-section', children: [
                { tag: 'h3', className: 'comp-section-title', children: [
                    { tag: 'i', className: 'fa-solid fa-hand-pointer' },
                    { tag: 'span', content: ' Button 按钮' },
                ]},
                { tag: 'div', className: 'comp-row', children: [
                    { tag: 'button', className: 'q-button q-button--default q-button--medium', content: '默认按钮' },
                    { tag: 'button', className: 'q-button q-button--primary q-button--medium', content: '主要按钮' },
                    { tag: 'button', className: 'q-button q-button--success q-button--medium', content: '成功按钮' },
                    { tag: 'button', className: 'q-button q-button--warning q-button--medium', content: '警告按钮' },
                    { tag: 'button', className: 'q-button q-button--danger q-button--medium', content: '危险按钮' },
                ]},
                { tag: 'div', className: 'comp-row', children: [
                    { tag: 'button', className: 'q-button q-button--primary q-button--small', content: '小按钮' },
                    { tag: 'button', className: 'q-button q-button--primary q-button--medium', content: '中按钮' },
                    { tag: 'button', className: 'q-button q-button--primary q-button--large', content: '大按钮' },
                ]},
                { tag: 'div', className: 'comp-row', children: [
                    { tag: 'button', className: 'q-button q-button--primary q-button--medium q-button--disabled', content: '禁用状态' },
                    { tag: 'button', className: 'q-button q-button--default q-button--medium', children: [
                        { tag: 'i', className: 'fa-solid fa-plus' },
                        { tag: 'span', content: ' 带图标' },
                    ]},
                ]},
            ]},

            // Badge 区域
            { tag: 'section', className: 'comp-section', children: [
                { tag: 'h3', className: 'comp-section-title', children: [
                    { tag: 'i', className: 'fa-solid fa-certificate' },
                    { tag: 'span', content: ' Badge 角标' },
                ]},
                { tag: 'div', className: 'comp-row', children: [
                    { tag: 'div', className: 'badge-demo', children: [
                        { tag: 'i', className: 'fa-solid fa-envelope badge-demo-icon' },
                        { tag: 'span', className: 'q-badge q-badge--dot' },
                    ]},
                    { tag: 'div', className: 'badge-demo', children: [
                        { tag: 'i', className: 'fa-solid fa-bell badge-demo-icon' },
                        { tag: 'span', className: 'q-badge', content: '5' },
                    ]},
                    { tag: 'div', className: 'badge-demo', children: [
                        { tag: 'i', className: 'fa-solid fa-comment badge-demo-icon' },
                        { tag: 'span', className: 'q-badge q-badge--warning', content: '99+' },
                    ]},
                ]},
            ]},

            // Nav 区域
            { tag: 'section', className: 'comp-section', children: [
                { tag: 'h3', className: 'comp-section-title', children: [
                    { tag: 'i', className: 'fa-solid fa-bars' },
                    { tag: 'span', content: ' Nav 导航' },
                ]},
                { tag: 'p', className: 'comp-desc', content: '左侧导航栏支持 expanded/collapsed 模式切换，点击顶栏按钮可测试。' },
                { tag: 'div', className: 'comp-row', children: [
                    { tag: 'div', className: 'nav-demo', children: [
                        { tag: 'div', className: 'nav-demo-item q-nav-item--active', children: [
                            { tag: 'i', className: 'fa-solid fa-house' },
                            { tag: 'span', content: '首页' },
                        ]},
                        { tag: 'div', className: 'nav-demo-item', children: [
                            { tag: 'i', className: 'fa-solid fa-gear' },
                            { tag: 'span', content: '设置' },
                        ]},
                        { tag: 'div', className: 'nav-demo-item', children: [
                            { tag: 'i', className: 'fa-solid fa-chart-line' },
                            { tag: 'span', content: '数据' },
                        ]},
                    ]},
                ]},
            ]},

            // Menu 区域
            { tag: 'section', className: 'comp-section', children: [
                { tag: 'h3', className: 'comp-section-title', children: [
                    { tag: 'i', className: 'fa-solid fa-list' },
                    { tag: 'span', content: ' Menu 菜单' },
                ]},
                { tag: 'p', className: 'comp-desc', content: '浮层菜单组件，支持子菜单和分割线。' },
            ]},

            // Tips 区域
            { tag: 'section', className: 'comp-section', children: [
                { tag: 'h3', className: 'comp-section-title', children: [
                    { tag: 'i', className: 'fa-solid fa-lightbulb' },
                    { tag: 'span', content: ' Tips 提示' },
                ]},
                { tag: 'div', className: 'comp-row', children: [
                    { tag: 'div', className: 'tips-demo tips-demo--info', children: [
                        { tag: 'i', className: 'fa-solid fa-circle-info' },
                        { tag: 'span', content: ' 信息提示' },
                    ]},
                    { tag: 'div', className: 'tips-demo tips-demo--success', children: [
                        { tag: 'i', className: 'fa-solid fa-circle-check' },
                        { tag: 'span', content: ' 成功提示' },
                    ]},
                    { tag: 'div', className: 'tips-demo tips-demo--warning', children: [
                        { tag: 'i', className: 'fa-solid fa-triangle-exclamation' },
                        { tag: 'span', content: ' 警告提示' },
                    ]},
                    { tag: 'div', className: 'tips-demo tips-demo--error', children: [
                        { tag: 'i', className: 'fa-solid fa-circle-xmark' },
                        { tag: 'span', content: ' 错误提示' },
                    ]},
                ]},
            ]},
        ],
    },
    body: {
        type: 'ComponentsPage',
    },
}) {}
