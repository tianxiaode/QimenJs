/**
 * 首页 — withTemplate 组件
 */

import { TemplateComponent } from '@qimenjs/component-core';

export class HomePage extends TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'home-page',
        children: [
            { tag: 'div', className: 'home-header', children: [
                { tag: 'span', name: 'home:title', content: 'title', className: 'home-title' },
                { tag: 'span', name: 'home:subtitle', content: 'subtitle', className: 'home-subtitle' },
            ]},
            { tag: 'p', name: 'home:desc', content: 'desc', className: 'home-desc' },
            { tag: 'div', className: 'home-actions', children: [
                { tag: 'a', name: 'home:compBtn', content: 'compBtn', className: 'home-btn', attrs: { href: '#/components' } },
                { tag: 'a', name: 'home:themeBtn', content: 'themeBtn', className: 'home-btn home-btn--outline', attrs: { href: '#/theme' } },
            ]},
        ],
    },
    body: {
        type: 'HomePage',
        title: 'QimenJS',
        subtitle: '组件演示',
        desc: '欢迎使用 QimenJS 组件系统！左侧导航支持 expanded/collapsed 模式切换，点击顶栏按钮即可测试。',
        compBtn: '<i class="fa-solid fa-cubes"></i> 查看组件',
        themeBtn: '<i class="fa-solid fa-palette"></i> 切换主题',
    },
}) {}
