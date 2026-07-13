/**
 * 首页 — withTemplate 组件
 *
 * 使用 JSON 模板 + data-content 声明节点，
 * withTemplate 自动生成 getter/setter。
 * defaults 通过 static defaults 声明内容默认值。
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
export class HomePage extends TemplateComponent.withTemplate([
    { tag: 'div', class: 'home-page', children: [
        { tag: 'div', class: 'home-header', children: [
            { tag: 'span', content: 'home:title', class: 'home-title' },
            { tag: 'span', content: 'home:subtitle', class: 'home-subtitle' },
        ]},
        { tag: 'p', content: 'home:desc', class: 'home-desc' },
        { tag: 'div', class: 'home-actions', children: [
            { tag: 'a', content: 'home:iconBtn', class: 'home-btn', attrs: { href: '#/icons' } },
            { tag: 'a', content: 'home:themeBtn', class: 'home-btn', attrs: { href: '#/theme' } },
        ]},
    ]},
]) {
    static type = 'HomePage';
    static defaults = {
        title: 'QimenJS',
        subtitle: '组件演示',
        desc: '欢迎使用 QimenJS 组件系统！这是一个使用 withTemplate 模式渲染的页面。',
        iconBtn: '<i class="q-icon-dragon"></i> 查看图标',
        themeBtn: '<i class="q-icon-yin-yang"></i> 切换主题',
    };
}
