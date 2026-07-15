/**
 * 首页 — withTemplate 组件
 *
 * 使用新版 ComponentTemplate 格式，
 * withTemplate 自动生成 getter/setter。
 * defaults 通过 body 声明内容默认值。
 */

import { TemplateComponent } from '@qimenjs/component-core';

/**
 * 首页组件
 *
 * 模板节点（自动生成 getter/setter）：
 * - home:title — 标题文本
 * - home:subtitle — 副标题文本
 * - home:desc — 描述文本
 * - home:iconBtn — 图标按钮
 * - home:themeBtn — 主题按钮
 */
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
                { tag: 'a', name: 'home:iconBtn', content: 'iconBtn', className: 'home-btn', attrs: { href: '#/icons' } },
                { tag: 'a', name: 'home:themeBtn', content: 'themeBtn', className: 'home-btn', attrs: { href: '#/theme' } },
            ]},
        ],
    },
    body: {
        type: 'HomePage',
        title: 'QimenJS',
        subtitle: '组件演示',
        desc: '欢迎使用 QimenJS 组件系统！这是一个使用 withTemplate 模式渲染的页面。',
        iconBtn: '<i class="q-icon-dragon"></i> 查看图标',
        themeBtn: '<i class="q-icon-yin-yang"></i> 切换主题',
    },
}) {}
