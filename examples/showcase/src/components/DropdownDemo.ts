import { Component, type TemplateDecl, type ListenItem } from '@qimenjs/component-core';
import type { DemoConfig, DemoSection } from './types';

/** Dropdown 选中项交互演示 */
class DropdownSelectDemo extends Component {
    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            classes: 'q-demo__row',
            children: [
                {
                    type: 'dropdown',
                    name: 'dd',
                    options: {
                        text: '选择操作',
                        popover: {
                            type: 'menu',
                            trigger: 'click',
                            anchor: 'self',
                            placement: 'bottom',
                            options: {
                                eventKey: 'dd-select',
                                items: [
                                    { text: '编辑', action: 'edit' },
                                    { text: '复制', action: 'copy' },
                                    { text: '删除', action: 'delete' },
                                ],
                            },
                        },
                    },
                },
                {
                    tag: 'div',
                    name: 'result',
                    classes: 'q-demo__hint',
                    options: { text: '点击下拉按钮选择操作' },
                },
            ],
        };
    }

    listens: ListenItem[] = [{ source: 'dd-select', events: { select: '_onDdSelect' } }];

    _onDdSelect(data: any): void {
        const action = data?.action;
        const result = this.getNodeEl('result');
        if (result && action) {
            result.textContent = `选中: ${action}`;
        }
    }
}

export const DROPDOWN_DEMO: DemoConfig = {
    title: 'Dropdown',
    description: '下拉按钮组件，继承 Button，带下拉箭头，items 自动生成菜单浮层',
    sections: [
        {
            label: '基本下拉',
            code: `{
    type: 'dropdown',
    options: {
        text: '操作',
        items: [
            { text: '编辑' },
            { text: '复制' },
            { text: '删除' },
        ],
    }
}`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'dropdown',
                        options: {
                            text: '操作',
                            items: [{ text: '编辑' }, { text: '复制' }, { text: '删除' }],
                        },
                    },
                ],
            },
        },
        {
            label: '带颜色的下拉',
            code: `{
    type: 'dropdown',
    options: {
        text: 'Primary',
        color: 'primary',
        items: [{ text: '选项 A' }, { text: '选项 B' }]
    }
}`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'dropdown',
                        options: {
                            text: 'Primary',
                            color: 'primary',
                            items: [{ text: '选项 A' }, { text: '选项 B' }],
                        },
                    },
                    {
                        type: 'dropdown',
                        options: {
                            text: 'Error',
                            color: 'error',
                            items: [{ text: '选项 A' }, { text: '选项 B' }],
                        },
                    },
                ],
            },
        },
        {
            label: 'Ghost 下拉',
            code: `{
    type: 'dropdown',
    options: {
        text: 'Ghost',
        ghost: true,
        items: [{ text: '选项 A' }, { text: '选项 B' }]
    }
}`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'dropdown',
                        options: {
                            text: 'Ghost Primary',
                            ghost: true,
                            color: 'primary',
                            items: [{ text: '选项 A' }, { text: '选项 B' }],
                        },
                    },
                    {
                        type: 'dropdown',
                        options: {
                            text: 'Ghost',
                            ghost: true,
                            items: [{ text: '选项 A' }, { text: '选项 B' }],
                        },
                    },
                ],
            },
        },
        {
            label: '隐藏箭头',
            code: `{
    type: 'dropdown',
    options: {
        text: 'No Arrow',
        arrowHidden: true,
        items: [{ text: '选项 A' }, { text: '选项 B' }]
    }
}`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'dropdown',
                        options: {
                            text: 'No Arrow',
                            arrowHidden: true,
                            items: [{ text: '选项 A' }, { text: '选项 B' }],
                        },
                    },
                    {
                        type: 'dropdown',
                        options: {
                            text: 'With Arrow',
                            items: [{ text: '选项 A' }, { text: '选项 B' }],
                        },
                    },
                ],
            },
        },
        {
            label: '选中项交互',
            code: `// popover 配置 eventKey，items 中每项可设置 action 字段
// 通过 listens 监听 select 事件，data.action 获取选中项
listens: [{ source: 'my-dd', events: { select: 'onSelect' } }]
onSelect(data) { console.log(data.action); }`,
            component: DropdownSelectDemo,
        } satisfies DemoSection,
        {
            label: 'Size',
            code: `{
    type: 'dropdown',
    options: { text: 'SM', size: 'sm', items: [{ text: 'A' }] }
}
{
    type: 'dropdown',
    options: { text: 'MD', size: 'md', items: [{ text: 'A' }] }
}
{
    type: 'dropdown',
    options: { text: 'LG', size: 'lg', items: [{ text: 'A' }] }
}`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'dropdown',
                        options: { text: 'SM', size: 'sm', items: [{ text: 'A' }] },
                    },
                    {
                        type: 'dropdown',
                        options: { text: 'MD', size: 'md', items: [{ text: 'A' }] },
                    },
                    {
                        type: 'dropdown',
                        options: { text: 'LG', size: 'lg', items: [{ text: 'A' }] },
                    },
                ],
            },
        },
    ],
};
