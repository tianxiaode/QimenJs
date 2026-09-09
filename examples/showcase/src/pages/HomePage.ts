/**
 * HomePage - 首页
 *
 * 使用 HeroComponent 展示框架核心特点，
 * 下方展示特性卡片列表。
 *
 * 所有展示文本（hero + 特性卡片）均为 @ 前缀 i18n key，
 * 由组件 setNodeText 自动解析翻译，语言切换即时刷新。
 */

import { Component, type TemplateDecl } from '@qimenjs/component-core';

/** 特性数据（i18n key，翻译见语言包 home.f0~f5） */
const FEATURES: { titleKey: string; descKey: string; tagKeys: string[] }[] = [
    {
        titleKey: '@home.f0.title',
        descKey: '@home.f0.desc',
        tagKeys: ['@home.f0.tag1', '@home.f0.tag2', '@home.f0.tag3'],
    },
    {
        titleKey: '@home.f1.title',
        descKey: '@home.f1.desc',
        tagKeys: ['@home.f1.tag1', '@home.f1.tag2', '@home.f1.tag3'],
    },
    {
        titleKey: '@home.f2.title',
        descKey: '@home.f2.desc',
        tagKeys: ['@home.f2.tag1', '@home.f2.tag2', '@home.f2.tag3'],
    },
    {
        titleKey: '@home.f3.title',
        descKey: '@home.f3.desc',
        tagKeys: ['@home.f3.tag1', '@home.f3.tag2', '@home.f3.tag3'],
    },
    {
        titleKey: '@home.f4.title',
        descKey: '@home.f4.desc',
        tagKeys: ['@home.f4.tag1', '@home.f4.tag2', '@home.f4.tag3'],
    },
    {
        titleKey: '@home.f5.title',
        descKey: '@home.f5.desc',
        tagKeys: ['@home.f5.tag1', '@home.f5.tag2', '@home.f5.tag3'],
    },
];

/** 首页模板 */
const HOME_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-home-page',
    style: { display: 'flex', flexDirection: 'column', padding: '40px', gap: '32px' },
    children: [
        {
            name: 'hero',
            type: 'hero',
            options: {
                title: '@hero.title',
                subtitle: '@hero.subtitle',
                desc: '@hero.desc',
                actionText: '@hero.action',
            },
        },
        {
            tag: 'section',
            name: 'features',
            classes: 'q-home-page__features',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px',
            },
            children: FEATURES.map((f, i) => ({
                name: `feature${i}`,
                type: 'card',
                classes: 'q-home-page__feature-card',
                options: {
                    title: f.titleKey,
                    body: {
                        tag: 'div',
                        name: 'body',
                        classes: 'q-home-page__feature-body',
                        style: { display: 'flex', flexDirection: 'column', gap: '8px' },
                        children: [
                            {
                                type: 'text',
                                name: 'desc',
                                options: { text: f.descKey, tag: 'p' },
                            },
                            {
                                type: 'tag',
                                options: { tags: f.tagKeys, size: 'sm' },
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
