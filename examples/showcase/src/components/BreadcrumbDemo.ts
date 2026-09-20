import { Component, type TemplateDecl, type DomEventsMap } from '@qimenjs/component-core';
import type { DemoConfig, DemoSection } from './types';

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
                            { text: '首页', href: '#/home' },
                            { text: '产品', href: '#/product' },
                            { text: '详情' },
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
        navigate: { path: 'bc', handler: '_onBcNavigate' },
    };

    _onBcNavigate(domEvt: any): void {
        const data = domEvt?.data?.data ?? domEvt?.data ?? domEvt;
        const href = data?.href;
        const result = this.getNodeEl('result');
        if (result && href) {
            result.textContent = `导航到: ${href}`;
        }
    }
}

export const BREADCRUMB_DEMO: DemoConfig = {
    title: 'Breadcrumb',
    description: '面包屑导航组件，从 ItemGroup 派生，子项用 HrefComponent 实现导航',
    sections: [
        {
            label: '基本用法',
            code: `{
    type: 'breadcrumb',
    options: {
        items: [
            { text: '首页', href: '#/home' },
            { text: '产品', href: '#/product' },
            { text: '详情' },
        ],
    }
}`,
            template: {
                type: 'breadcrumb',
                options: {
                    items: [
                        { text: '首页', href: '#/home' },
                        { text: '产品', href: '#/product' },
                        { text: '详情' },
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
            { text: 'Step 1', href: '#/s1' },
            { text: 'Step 2', href: '#/s2' },
            { text: 'Step 3' },
        ],
    }
}`,
            template: {
                type: 'breadcrumb',
                options: {
                    separator: '>',
                    items: [
                        { text: 'Step 1', href: '#/s1' },
                        { text: 'Step 2', href: '#/s2' },
                        { text: 'Step 3' },
                    ],
                },
            },
        },
        {
            label: '点击交互',
            code: `// HrefComponent 自带 router: 'navigate'
// 监听 navigate 事件获取 href
bc.on('navigate', (data) => {
    console.log(data.href);
})`,
            component: BreadcrumbClickDemo,
        } satisfies DemoSection,
    ],
};
