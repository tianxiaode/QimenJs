/**
 * 主题页 — withTemplate 组件
 *
 * 使用新版 ComponentTemplate 格式，
 * 主题卡片通过 nodeMap 动态填充。
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { ThemeRegistrar } from '@qimenjs/theme';

const THEMES = [
    { name: 'light', label: '亮色' },
    { name: 'dark', label: '暗色' },
    { name: 'celadon', label: '青瓷' },
    { name: 'cinnabar', label: '朱砂' },
    { name: 'indigo', label: '靛蓝' },
    { name: 'yellow', label: '鹅黄' },
    { name: 'rosewood', label: '紫檀' },
    { name: 'ink', label: '墨色' },
    { name: 'dai', label: '黛色' },
];

/**
 * 主题页组件
 *
 * 模板节点（自动生成 getter/setter）：
 * - theme:title — 页面标题
 * - theme:grid — 主题卡片网格容器
 */
export class ThemePage extends TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'theme-page',
        children: [
            { tag: 'h2', name: 'theme:title', content: 'title', className: 'page-title' },
            { tag: 'div', name: 'theme:grid', content: 'grid', className: 'theme-grid' },
        ],
    },
    body: {
        type: 'ThemePage',
        title: '主题系统',
    },
}) {
    /** 初始化后填充主题卡片 */
    _initWithTemplate(props?: Record<string, any>): void {
        super._initWithTemplate(props);
        const gridEl = this.nodeMap?.theme?.grid?.el;
        if (gridEl) {
            gridEl.innerHTML = THEMES.map(t =>
                `<button class="theme-card" onclick="window.__switchTheme('${t.name}')">
                    <div class="theme-preview" data-theme="${t.name}"></div>
                    <span class="theme-label">${t.label}</span>
                </button>`
            ).join('');
        }
    }
}
