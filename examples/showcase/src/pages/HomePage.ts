/**
 * HomePage - 首页
 *
 * 使用 HeroComponent 展示框架核心特点，
 * 下方展示特性卡片列表。
 */

import { Component, type TemplateDecl } from '@qimenjs/component-core';

/** 特性数据 */
const FEATURES = [
    {
        title: '模板驱动',
        desc: '声明式 TplNode 定义组件结构，useTemplate 一行绑定，告别手动 DOM 操作',
        tags: ['useTemplate', 'TplNode'],
    },
    {
        title: 'Ability 架构',
        desc: '纯对象能力混入，按需组合路由、事件、尺寸等能力，零继承负担',
        tags: ['RouteEventBusAbility', 'SystemEventBusAbility'],
    },
    {
        title: 'Extends 模式',
        desc: '组件 extends 继承 + 静态 useTemplate，编译时确定结构，运行时零开销',
        tags: ['extends', 'Component'],
    },
    {
        title: '丰富组件库',
        desc: '50+ 开箱即用组件：Button、Card、Table、Form、Dialog、Tabs…',
        tags: ['Button', 'Card', 'Table'],
    },
    {
        title: '主题系统',
        desc: 'CSS 变量驱动，零 JS 开销切换亮色/暗色/自定义主题，按需打包',
        tags: ['Design Tokens', 'CSS Variables'],
    },
    {
        title: '国际化',
        desc: 'I18nManager 内置多语言支持，@ 前缀自动翻译，事件驱动的语言切换',
        tags: ['i18n', 'locale'],
    },
];

/** 首页模板 */
const HOME_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-home-page flex flex-col flex-center',
    children: [
        {
            type: 'hero',
            classes: 'q-home-page__hero',
            options: {
                title: '@hero.title',
                subtitle: '@hero.subtitle',
                desc: '@hero.desc',
                actionText: '@hero.action',
            },
        },
        {
            tag: 'section',
            classes: 'q-home-page__features flex flex-row flex-warp',
            style: { gap: '6px', padding: '16px' }, // 特性卡片间距
            children: FEATURES.map((f, i) => ({
                name: `feature${i}`,
                type: 'card',
                classes: 'q-home-page__feature-card',
                options: {
                    title: f.title,
                    body: {
                        tag: 'div',
                        children: [
                            {
                                type: 'text',
                                classes: 'q-home-page__feature-desc',
                                options: { text: f.desc, tag: 'p' },
                            },
                        ],
                    },
                },
            })),
        },
    ],
};

/** 首页组件 */
export class HomePage extends Component {
    get tpl(): TemplateDecl {
        return HOME_TPL;
    }
}
