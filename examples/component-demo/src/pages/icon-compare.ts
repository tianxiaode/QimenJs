/**
 * 图标对比页 — SVG 内联 vs 字体渲染
 *
 * 左侧：SVG 内联渲染（直接插入 <svg> 标签）
 * 右侧：字体图标渲染（<i class="q-icon-xxx">）
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

// 通过 Vite ?raw 导入所有 SVG 文件内容
const svgModules = import.meta.glob('../../../../src/icon/svg/*.svg', { query: '?raw', eager: true, import: 'default' }) as Record<string, string>;

const SVG_MAP: Record<string, string> = {};
for (const [path, content] of Object.entries(svgModules)) {
    const name = path.replace(/^.*\/(.+)\.svg$/, '$1');
    SVG_MAP[name] = content;
}

export class IconComparePage extends TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'icon-compare-page',
        children: [
            { tag: 'h2', name: 'compare:title', content: 'title', className: 'page-title' },
            { tag: 'p', className: 'compare-desc', content: 'desc' },
            { tag: 'div', className: 'compare-panels', children: [
                { tag: 'div', name: 'compare:svg-panel', className: 'compare-panel svg-panel', children: [
                    { tag: 'h3', content: 'svgTitle' },
                    { tag: 'div', name: 'compare:svg-grid', className: 'icon-grid' },
                ]},
                { tag: 'div', name: 'compare:font-panel', className: 'compare-panel font-panel', children: [
                    { tag: 'h3', content: 'fontTitle' },
                    { tag: 'div', name: 'compare:font-grid', className: 'icon-grid' },
                ]},
            ]},
        ],
    },
    body: {
        type: 'IconComparePage',
        title: '图标对比 — SVG vs 字体',
        desc: '左侧为 SVG 内联渲染，右侧为字体图标渲染，对比两者视觉效果是否一致',
        svgTitle: 'SVG 内联渲染',
        fontTitle: '字体图标渲染',
    },
}) {
    _initWithTemplate(props?: Record<string, any>): void {
        super._initWithTemplate(props);

        const svgGridEl = this.nodeMap?.compare?.['svg-grid']?.el;
        const fontGridEl = this.nodeMap?.compare?.['font-grid']?.el;

        if (svgGridEl) {
            svgGridEl.innerHTML = ICON_NAMES.map(name => {
                const svgContent = SVG_MAP[name] || '';
                const sizedSvg = svgContent
                    .replace(/width="[^"]*"/, 'width="24"')
                    .replace(/height="[^"]*"/, 'height="24"');
                return `<div class="icon-item" title="svg: ${name}">
                    <div class="svg-icon-wrap">${sizedSvg}</div>
                    <span class="icon-name">${name}</span>
                </div>`;
            }).join('');
        }

        if (fontGridEl) {
            fontGridEl.innerHTML = ICON_NAMES.map(name =>
                `<div class="icon-item" title="font: ${name}">
                    <i class="q-icon-${name}"></i>
                    <span class="icon-name">${name}</span>
                </div>`
            ).join('');
        }
    }
}
