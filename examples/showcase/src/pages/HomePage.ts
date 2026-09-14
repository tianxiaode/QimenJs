/**
 * HomePage - 首页
 *
 * 使用 HeroComponent 展示框架核心特点，
 * 每个特性卡片均为独立 hero 区域。
 *
 * 所有展示文本均为 @ 前缀 i18n key，
 * 由组件 setNodeText 自动解析翻译，语言切换即时刷新。
 */

import { Component, type TemplateDecl } from '@qimenjs/component-core';

/** 特性数据（i18n key，翻译见语言包 home.f0~f5） */
const FEATURES: { titleKey: string; descKey: string }[] = [
    { titleKey: '@home.f0.title', descKey: '@home.f0.desc' },
    { titleKey: '@home.f1.title', descKey: '@home.f1.desc' },
    { titleKey: '@home.f2.title', descKey: '@home.f2.desc' },
    { titleKey: '@home.f3.title', descKey: '@home.f3.desc' },
    { titleKey: '@home.f4.title', descKey: '@home.f4.desc' },
    { titleKey: '@home.f5.title', descKey: '@home.f5.desc' },
];

/** 首页模板 */
const HOME_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-home-page',
    style: { display: 'flex', flexDirection: 'column', gap: '0' },
    children: [
        {
            name: 'hero',
            type: 'hero',
            options: {
                title: '@hero.title',
                subtitle: '@hero.subtitle',
                desc: '@hero.desc',
                actionText: '@hero.action',
                actionHref: '#/components',
            },
        },
        ...FEATURES.map((f, i) => ({
            name: `feature${i}`,
            type: 'hero',
            options: {
                title: f.titleKey,
                desc: f.descKey,
            },
        })),
    ],
};

/** 首页组件 */
export class HomePage extends Component {
    get tpl(): TemplateDecl {
        return HOME_TPL;
    }
}
