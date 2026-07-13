/**
 * 主题页 — withTemplate 组件
 *
 * 使用 JSON 模板 + data-content 声明节点，
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
export class ThemePage extends TemplateComponent.withTemplate([
    { tag: 'div', class: 'theme-page', children: [
        { tag: 'h2', content: 'theme:title', class: 'page-title' },
        { tag: 'div', content: 'theme:grid', class: 'theme-grid' },
    ]},
]) {
    static type = 'ThemePage';
    static defaults = {
        title: '主题系统',
    };

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
