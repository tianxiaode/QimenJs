import type { DemoConfig } from './types';

export const HERO_DEMO: DemoConfig = {
    title: 'Hero',
    description: '英雄区组件，由 title + subtitle + desc + actionText/actionHref + image/imagePosition 组成',
    sections: [
        {
            label: '基础英雄区',
            code: `{ type: 'hero', options: { title: '欢迎来到 QimenJS' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'hero', options: { title: '欢迎来到 QimenJS' } },
                ],
            },
        },
        {
            label: '带副标题和描述',
            code: `{ type: 'hero', options: { title: '构建卓越应用', subtitle: '组件化框架', desc: 'QimenJS 提供丰富的 UI 组件，助力快速开发' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'hero',
                        options: {
                            title: '构建卓越应用',
                            subtitle: '组件化框架',
                            desc: 'QimenJS 提供丰富的 UI 组件，助力快速开发',
                        },
                    },
                ],
            },
        },
        {
            label: '带行动按钮',
            code: `{ type: 'hero', options: { title: '立即开始', actionText: '点击这里', actionHref: '#' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'hero',
                        options: {
                            title: '立即开始',
                            actionText: '点击这里',
                            actionHref: '#',
                        },
                    },
                ],
            },
        },
        {
            label: '带图片 (image)',
            code: `{ type: 'hero', options: { title: '产品展示', image: 'https://picsum.photos/400/300', imagePosition: 'right' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'hero',
                        options: {
                            title: '产品展示',
                            subtitle: '全新体验',
                            desc: '图片在右侧的英雄区布局',
                            image: 'https://picsum.photos/400/300',
                            imagePosition: 'right',
                        },
                    },
                ],
            },
        },
        {
            label: '图片在左侧 (imagePosition: left)',
            code: `{ type: 'hero', options: { title: '左侧图片', image: 'https://picsum.photos/400/300', imagePosition: 'left' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'hero',
                        options: {
                            title: '左侧图片',
                            subtitle: '图文左右切换',
                            desc: '通过 imagePosition 控制图片在左或右',
                            image: 'https://picsum.photos/400/300',
                            imagePosition: 'left',
                        },
                    },
                ],
            },
        },
    ],
};
