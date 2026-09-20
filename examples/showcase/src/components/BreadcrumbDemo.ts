import { Component, type TemplateDecl, type DomEventsMap } from '@qimenjs/component-core';
import type { DemoConfig, DemoSection } from './types';

/** Breadcrumb 点击交互演示 */
class BreadcrumbClickDemo extends Component {
    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            style: { display: 'flex', flexDirection: 'column', gap: '12px' },
            children: [
                {
                    type: 'breadcrumb',
                    name: 'bc',
                    options: {
                        items: [
                            { text: '首页', key: 'home' },
                            { text: '产品', key: 'product' },
                            { text: '详情', key: 'detail' },
                        ],
                    },
                },
                {
                    tag: 'div',
                    name: 'result',
                    classes: 'q-demo__hint',
                    options: { text: '点击面包屑项查看效果' },
                },
            ],
        };
    }

    domEvents: DomEventsMap = {
        click: { path: 'bc', handler: '_onBcClick' },
    };

    _onBcClick(domEvt: any): void {
        const key = domEvt?.data?.key;
        const index = domEvt?.data?.index;
        const result = this.getNodeEl('result');
        if (result && key !== undefined) {
            result.textContent = `点击了: ${key} (index=${index})`;
        }
    }
}

export const BREADCRUMB_DEMO: DemoConfig = {
    title: 'Breadcrumb',
    description: '面包屑导航组件，支持 items 配置和自定义分隔符',
    sections: [
        {
            label: '基本用法',
            code: `{
    type: 'breadcrumb',
    options: {
        items: [
            { text: '首页', key: 'home' },
            { text: '产品', key: 'product' },
            { text: '详情', key: 'detail' },
        ],
    }
}`,
            template: {
                type: 'breadcrumb',
                options: {
                    items: [
                        { text: '首页', key: 'home' },
                        { text: '产品', key: 'product' },
                        { text: '详情', key: 'detail' },
                    ],
                },
            },
        },
        {
            label: '自定义分隔符',
            code: `{
    type: 'breadcrumb',
    options: {
        separator: '>',
        items: [
            { text: 'Step 1', key: 's1' },
            { text: 'Step 2', key: 's2' },
            { text: 'Step 3', key: 's3' },
        ],
    }
}`,
            template: {
                type: 'breadcrumb',
                options: {
                    separator: '>',
                    items: [
                        { text: 'Step 1', key: 's1' },
                        { text: 'Step 2', key: 's2' },
                        { text: 'Step 3', key: 's3' },
                    ],
                },
            },
        },
        {
            label: '点击交互',
            code: `// 点击面包屑项触发 navigate 事件
// domEvt.data 包含 key 和 index
bc.on('navigate', (data) => {
    console.log(data.key, data.index);
})`,
            component: BreadcrumbClickDemo,
        } satisfies DemoSection,
    ],
};
