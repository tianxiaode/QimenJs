/**
 * ComponentsPage - 组件展示页
 *
 * 左侧组件导航侧栏 + 右侧组件演示区域。
 * 点击左侧组件名 → hash 变化 → 路由事件 → 右侧动态切换演示内容。
 */

import { Component, type TemplateDecl, type DomEventsMap } from '@qimenjs/component-core';
import type { DemoConfig } from '../components/types';
import { BUTTON_DEMO } from '../components/ButtonDemo';
import { AVATAR_DEMO } from '../components/AvatarDemo';
import { BUTTON_GROUP_DEMO } from '../components/ButtonGroupDemo';
import { DIVIDER_DEMO } from '../components/DividerDemo';
import { HTML_DEMO } from '../components/HtmlDemo';
import { ICON_DEMO } from '../components/IconDemo';
import { LABEL_DEMO } from '../components/LabelDemo';
import { SPACER_DEMO } from '../components/SpacerDemo';
import { TEXT_DEMO } from '../components/TextDemo';
import { CARD_DEMO } from '../components/CardDemo';
import { FIELDSET_DEMO } from '../components/FieldsetDemo';
import { HEADER_DEMO } from '../components/HeaderDemo';
import { HERO_DEMO } from '../components/HeroDemo';
import { PANEL_DEMO } from '../components/PanelDemo';
import { TABS_DEMO } from '../components/TabsDemo';
import { BREADCRUMB_DEMO } from '../components/BreadcrumbDemo';
import { DROPDOWN_DEMO } from '../components/DropdownDemo';
import { MENU_DEMO } from '../components/MenuDemo';
import { NAV_DEMO } from '../components/NavDemo';
import { NAVBAR_DEMO } from '../components/NavbarDemo';
import { TREENAV_DEMO } from '../components/TreeNavDemo';

/** 组件分类 */
const COMPONENT_CATEGORIES = [
    {
        label: '基础元素',
        components: [
            'Avatar',
            'Button',
            'ButtonGroup',
            'Divider',
            'Html',
            'Icon',
            'Label',
            'Spacer',
            'Text',
        ],
    },
    {
        label: '布局容器',
        components: ['Card', 'Fieldset', 'Header', 'Hero', 'Panel', 'Tabs'],
    },
    {
        label: '导航',
        components: ['Breadcrumb', 'Dropdown', 'Menu', 'Nav', 'Navbar', 'TreeNav'],
    },
    {
        label: '数据展示',
        components: ['Accordion', 'Alert', 'List', 'Progress', 'Statistic', 'Table', 'Tag'],
    },
    {
        label: '表单',
        components: ['Date', 'Form', 'Toggle'],
    },
    {
        label: '交互工具',
        components: ['Dialog', 'EntityToolbar', 'ItemGroup', 'Toolbar'],
    },
];

/** 组件演示映射 */
const DEMO_MAP: Record<string, DemoConfig> = {
    Button: BUTTON_DEMO,
    ButtonGroup: BUTTON_GROUP_DEMO,
    Avatar: AVATAR_DEMO,
    Divider: DIVIDER_DEMO,
    Html: HTML_DEMO,
    Icon: ICON_DEMO,
    Label: LABEL_DEMO,
    Spacer: SPACER_DEMO,
    Text: TEXT_DEMO,
    Card: CARD_DEMO,
    Fieldset: FIELDSET_DEMO,
    Header: HEADER_DEMO,
    Hero: HERO_DEMO,
    Panel: PANEL_DEMO,
    Tabs: TABS_DEMO,
    Breadcrumb: BREADCRUMB_DEMO,
    Dropdown: DROPDOWN_DEMO,
    Menu: MENU_DEMO,
    Nav: NAV_DEMO,
    Navbar: NAVBAR_DEMO,
    TreeNav: TREENAV_DEMO,
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
            children: COMPONENT_CATEGORIES.map(cat => ({
                tag: 'div',
                classes: 'q-components-page__nav-group',
                children: [
                    {
                        tag: 'div',
                        classes: 'q-components-page__nav-category',
                        options: { text: cat.label },
                    },
                    ...cat.components.map(name => ({
                        tag: 'div',
                        classes: 'q-components-page__nav-item',
                        name: `nav-${name.toLowerCase()}`,
                        attributes: { 'data-component': name },
                        options: { text: name },
                    })),
                ],
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
                            options: { text: 'QimenJS 组件库' },
                        },
                        {
                            tag: 'p',
                            classes: 'q-components-page__overview-desc',
                            options: {
                                text: 'QimenJS 是一个基于组合式架构的轻量 Web 组件框架，通过 Ability 系统实现功能解耦与按需组合，提供声明式模板、事件委托、option 驱动渲染等核心能力。',
                            },
                        },
                        {
                            tag: 'div',
                            classes: 'q-components-page__overview-section',
                            children: [
                                {
                                    tag: 'h3',
                                    options: { text: '组件体系' },
                                },
                                {
                                    tag: 'p',
                                    options: {
                                        text: '所有组件从 Component 基类派生，通过 withAbilities 组合 Ability（如 SizeAbility、ColorAbility、OverlayAbility 等）获得对应能力，通过 withDefinitions 定义 option 及其他成员。组件通过 option 配置驱动渲染，支持 string | ComponentClass | TemplateDecl 三路内容模式。',
                                    },
                                },
                            ],
                        },
                        {
                            tag: 'div',
                            classes: 'q-components-page__overview-section',
                            children: [
                                {
                                    tag: 'h3',
                                    options: { text: '核心能力' },
                                },
                                {
                                    tag: 'ul',
                                    classes: 'q-components-page__overview-list',
                                    children: [
                                        {
                                            tag: 'li',
                                            options: {
                                                text: '声明式模板（TemplateDecl）—— 类级静态编译缓存',
                                            },
                                        },
                                        {
                                            tag: 'li',
                                            options: {
                                                text: '事件委托（DomEventsEngine）—— 路径匹配 + 多 handler 执行',
                                            },
                                        },
                                        {
                                            tag: 'li',
                                            options: {
                                                text: 'Option 驱动 —— onXxxOptionChange 响应式更新',
                                            },
                                        },
                                        {
                                            tag: 'li',
                                            options: {
                                                text: 'Ability 组合 —— Size/Color/Overlay/Mask/RAF 等按需引入',
                                            },
                                        },
                                        {
                                            tag: 'li',
                                            options: {
                                                text: 'i18n 国际化 —— @ 前缀自动翻译 + 语言切换刷新',
                                            },
                                        },
                                        {
                                            tag: 'li',
                                            options: {
                                                text: '路由系统 —— hash 模式 + RouteContainerComponent',
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            tag: 'div',
                            classes: 'q-components-page__overview-section',
                            children: [
                                {
                                    tag: 'h3',
                                    options: { text: '使用方式' },
                                },
                                {
                                    tag: 'p',
                                    options: {
                                        text: '在模板中通过 type 引用组件名、options 传递配置；在代码中通过 new ComponentClass({ container }) 实例化。组件支持 extend() 派生子类、define() 注册子节点定义。',
                                    },
                                },
                            ],
                        },
                        {
                            tag: 'div',
                            classes: 'q-components-page__overview-section',
                            children: [
                                {
                                    tag: 'h3',
                                    options: { text: '可用组件' },
                                },
                                {
                                    tag: 'p',
                                    options: {
                                        text: '当前共 35 个组件，按 6 个分类组织：基础元素（9）、布局容器（6）、导航（6）、数据展示（7）、表单（3）、交互工具（4）。从左侧导航选择组件查看详细演示。',
                                    },
                                },
                            ],
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
    _currentDemoName: string | null = null;
    _interactiveInstances: any[] = [];

    get tpl(): TemplateDecl {
        return COMPONENTS_TPL;
    }

    listens = [{ route: 'router', events: { change: 'onRouteChange' } }];

    domEvents: DomEventsMap = {
        click: { path: 'sidebar', handler: '_onNavClick' },
    };

    onAfterInit(): void {
        const hash = window.location.hash;
        const path = hash ? hash.slice(1) : '';
        if (path.startsWith('/components/')) {
            const componentName = path.slice('/components/'.length).split('/')[0];
            if (componentName) {
                this._showDemo(componentName);
            }
        }
    }

    onRouteChange(event: any): void {
        const path: string = event?.path ?? '';
        if (path.startsWith('/components/')) {
            const componentName = path.slice('/components/'.length).split('/')[0];
            if (componentName) {
                this._showDemo(componentName);
            }
        }
    }

    _onNavClick(domEvt: any): void {
        const target = domEvt?.data?.originalEvent?.target ?? domEvt?.target;
        const componentName = target?.dataset?.component;
        if (!componentName) return;
        window.location.hash = `/components/${componentName}`;
    }

    _showDemo(componentName: string): void {
        if (this._currentDemoName === componentName) return;
        this._currentDemoName = componentName;

        const config = DEMO_MAP[componentName];
        const contentEl = this.getNodeEl('content');
        if (!contentEl) return;

        if (this._currentDemo) {
            this._currentDemo.dispose();
            this._currentDemo = null;
        }
        this._interactiveInstances.forEach(inst => inst.dispose());
        this._interactiveInstances = [];
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
                        {
                            tag: 'p',
                            classes: 'q-demo__desc',
                            options: { text: config.description },
                        },
                    ],
                },
                ...config.sections.map((section, i) => ({
                    tag: 'div',
                    classes: 'q-demo__section',
                    children: [
                        {
                            tag: 'h3',
                            classes: 'q-demo__section-label',
                            options: { text: section.label },
                        },
                        section.component
                            ? { tag: 'div', name: `section-${i}`, classes: 'q-demo__interactive' }
                            : section.template,
                        ...(section.code
                            ? [
                                  {
                                      tag: 'pre',
                                      classes: 'q-demo__code',
                                      children: [{ tag: 'code', options: { text: section.code } }],
                                  },
                              ]
                            : []),
                    ],
                })),
            ],
        };

        this._currentDemo = new (Component.extend({
            type: 'component-demo',
            tpl: demoTpl,
        }))({ container: contentEl });

        config.sections.forEach((section, i) => {
            if (section.component) {
                const containerEl = this._currentDemo.getNodeEl(`section-${i}`);
                if (containerEl) {
                    this._interactiveInstances.push(
                        new section.component({ container: containerEl })
                    );
                }
            }
        });
    }
}
