/**
 * 图标页 — withTemplate 组件
 *
 * 使用新版 ComponentTemplate 格式，
 * 图标网格通过 nodeMap 动态填充。
 */

import { TemplateComponent } from '@qimenjs/component-core';

const ICON_NAMES = [
    'save', 'refresh', 'edit', 'delete', 'add', 'copy', 'paste', 'cut',
    'undo', 'redo', 'close', 'check', 'print', 'lock', 'unlock', 'export',
    'back', 'forward', 'up', 'down', 'left', 'right', 'upload', 'download',
    'search', 'filter', 'settings', 'menu', 'more', 'home', 'dashboard', 'notification',
    'success', 'warning', 'error', 'info', 'question', 'star', 'heart', 'flag',
    'tag', 'bell', 'file', 'folder', 'calendar', 'clock', 'mail', 'chat',
    'chart-bar', 'table', 'shopping', 'cart', 'wallet', 'coin', 'order',
    'dragon', 'phoenix', 'lantern', 'teapot', 'bamboo', 'plum', 'seal', 'scroll',
    'abacus', 'brush', 'ink', 'fan', 'temple', 'greatwall', 'china', 'yin-yang',
];

/**
 * 图标页组件
 *
 * 模板节点（自动生成 getter/setter）：
 * - icons:title — 页面标题
 * - icons:grid — 图标网格容器
 */
export class IconsPage extends TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'icons-page',
        children: [
            { tag: 'h2', name: 'icons:title', content: 'title', className: 'page-title' },
            { tag: 'div', name: 'icons:grid', content: 'grid', className: 'icon-grid' },
        ],
    },
    body: {
        type: 'IconsPage',
        title: '图标库 — 全部图标',
    },
}) {
    /** 初始化后填充图标网格 */
    _initWithTemplate(props?: Record<string, any>): void {
        super._initWithTemplate(props);
        const gridEl = this.nodeMap?.icons?.grid?.el;
        if (gridEl) {
            gridEl.innerHTML = ICON_NAMES.map(name =>
                `<div class="icon-item" title="q-icon-${name}">
                    <i class="q-icon-${name}"></i>
                    <span class="icon-name">${name}</span>
                </div>`
            ).join('');
        }
    }
}
