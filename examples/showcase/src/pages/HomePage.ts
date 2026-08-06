/**
 * HomePage - 首页
 *
 * 使用 HeroComponent 展示框架核心特点，
 * 下方展示特性卡片列表。
 */

import { Component, type TplNode } from '@qimenjs/component-core';
import { HeroComponent, CardComponent, TagComponent } from '@qimenjs/component';
import { t } from '@qimenjs/i18n';

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
        desc: 'ThemeRegistrar 主题注册器，运行时动态切换亮色/暗色/自定义主题',
        tags: ['ThemeRegistrar', 'CSS Variables'],
    },
    {
        title: '国际化',
        desc: 'I18nManager 内置多语言支持，i18n: 前缀自动翻译，事件驱动的语言切换',
        tags: ['i18n', 'locale'],
    },
];

/** 首页模板 */
const HOME_TPL: TplNode = {
    tag: 'div',
    cls: 'q-home-page',
    flex: { direction: 'column', align: 'center' },
    children: [
        {
            name: 'hero',
            type: HeroComponent,
            cls: 'q-home-page__hero',
        },
        {
            tag: 'section',
            cls: 'q-home-page__features',
            children: FEATURES.map((f, i) => ({
                name: `feature${i}`,
                type: CardComponent,
                cls: 'q-home-page__feature-card',
                children: [
                    { tag: 'h3', cls: 'q-home-page__feature-title', text: f.title },
                    { tag: 'p', cls: 'q-home-page__feature-desc', text: f.desc },
                    {
                        tag: 'div',
                        cls: 'q-home-page__feature-tags',
                        flex: { direction: 'row', gap: '6px', wrap: true },
                        children: f.tags.map(t => ({
                            type: TagComponent,
                            text: t,
                            cls: 'q-home-page__feature-tag',
                        })),
                    },
                ],
            })),
        },
    ],
};

/** 首页组件 */
export class HomePage extends Component {
    onAfterInit(): void {
        const hero = this.nodeMap.hero?.component;
        if (!hero) return;

        hero.update({
            title: t('hero.title', undefined, 'QimenJS'),
            subtitle: t('hero.subtitle'),
            desc: t('hero.desc'),
            actionText: t('hero.action'),
        });

        hero.on('action', () => {
            window.location.hash = '#/components';
        });
    }
}

HomePage.useTemplate(HOME_TPL);
export type HomePageInstance = InstanceType<typeof HomePage>;
