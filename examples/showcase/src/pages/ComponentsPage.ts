/**
 * ComponentsPage - 组件展示页
 *
 * 左侧组件导航侧栏 + 右侧组件演示区域。
 * 点击左侧组件名 → 右侧动态切换演示内容。
 */

import { Component, type TemplateDecl, type DomEventsMap } from '@qimenjs/component-core';

/** 已注册组件列表（按字母排序） */
const COMPONENTS_LIST = [
    'Avatar',
    'Button',
    'Card',
    'Dropdown',
    'Hero',
    'Href',
    'Menu',
    'Navbar',
    'Tag',
    'Text',
    'Toggle',
];

/** 组件演示配置 */
interface DemoConfig {
    title: string;
    description: string;
    sections: { label: string; template: TemplateDecl }[];
}

/** Button 演示配置 */
const BUTTON_DEMO: DemoConfig = {
    title: 'Button',
    description: '按钮组件，支持 size/color/outline/disabled/pressed 等 option',
    sections: [
        {
            label: 'Size',
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'button', options: { text: 'Small', size: 'sm' } },
                    { type: 'button', options: { text: 'Medium', size: 'md' } },
                    { type: 'button', options: { text: 'Large', size: 'lg' } },
                ],
            },
        },
        {
            label: 'Color',
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'button', options: { text: 'Primary', color: 'primary' } },
                    { type: 'button', options: { text: 'Secondary', color: 'secondary' } },
                    { type: 'button', options: { text: 'Success', color: 'success' } },
                    { type: 'button', options: { text: 'Warning', color: 'warning' } },
                    { type: 'button', options: { text: 'Error', color: 'error' } },
                ],
            },
        },
        {
            label: 'Outline',
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'button', options: { text: 'Primary', color: 'primary', outline: true } },
                    { type: 'button', options: { text: 'Success', color: 'success', outline: true } },
                    { type: 'button', options: { text: 'Error', color: 'error', outline: true } },
                ],
            },
        },
        {
            label: 'Disabled',
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'button', options: { text: 'Disabled', disabled: true } },
                    { type: 'button', options: { text: 'Disabled Outline', disabled: true, outline: true } },
                ],
            },
        },
        {
            label: 'Pressed (两态按钮)',
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'button', options: { text: 'Normal' } },
                    { type: 'button', options: { text: 'Pressed', pressed: true } },
                ],
            },
        },
    ],
};

/** 组件演示映射 */
const DEMO_MAP: Record<string, DemoConfig> = {
    Button: BUTTON_DEMO,
};

/** 首页模板 */
const COMPONENTS_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-components-page',
    style: { display: 'flex', flexDirection: 'row', minHeight: '100%' },
    children: [
        {
            tag: 'aside',
            name: 'sidebar',
            classes: 'q-components-page__sidebar',
            children: COMPONENTS_LIST.map(name => ({
                tag: 'div',
                classes: 'q-components-page__nav-item',
                name: `nav-${name.toLowerCase()}`,
                attributes: { 'data-component': name },
                options: { text: name },
            })),
        },
        {
            tag: 'main',
            name: 'content',
            classes: 'q-components-page__main',
            children: [
                {
                    tag: 'div',
                    classes: 'q-components-page__overview',
                    children: [
                        {
                            tag: 'h2',
                            classes: 'q-components-page__overview-title',
                            options: { text: '组件概览' },
                        },
                        {
                            tag: 'p',
                            classes: 'q-components-page__overview-desc',
                            options: { text: '从左侧选择一个组件查看演示和说明' },
                        },
                    ],
                },
            ],
        },
    ],
};

/** 组件展示页组件 */
export class ComponentsPage extends Component {
    _currentDemo: any = null;

    get tpl(): TemplateDecl {
        return COMPONENTS_TPL;
    }

    domEvents: DomEventsMap = {
        click: { path: 'sidebar', handler: '_onNavClick' },
    };

    _onNavClick(domEvt: any): void {
        const componentName = domEvt?.target?.dataset?.component;
        if (!componentName) return;
        this._showDemo(componentName);
    }

    _showDemo(componentName: string): void {
        const config = DEMO_MAP[componentName];
        const contentEl = this.getNodeEl('content');
        if (!contentEl) return;

        if (this._currentDemo) {
            this._currentDemo.dispose();
            this._currentDemo = null;
        }
        contentEl.innerHTML = '';

        if (!config) {
            contentEl.innerHTML = `<div class="q-components-page__coming-soon">${componentName} 演示即将上线</div>`;
            return;
        }

        const demoTpl: TemplateDecl = {
            tag: 'div',
            classes: 'q-demo',
            children: [
                {
                    tag: 'div',
                    classes: 'q-demo__header',
                    children: [
                        { tag: 'h2', classes: 'q-demo__title', options: { text: config.title } },
                        { tag: 'p', classes: 'q-demo__desc', options: { text: config.description } },
                    ],
                },
                ...config.sections.map(section => ({
                    tag: 'div',
                    classes: 'q-demo__section',
                    children: [
                        { tag: 'h3', classes: 'q-demo__section-label', options: { text: section.label } },
                        section.template,
                    ],
                })),
            ],
        };

        this._currentDemo = new (Component.extend({
            type: 'component-demo',
            tpl: demoTpl,
        }))({ container: contentEl });
    }
}
