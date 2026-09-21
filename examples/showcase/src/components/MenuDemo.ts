import { Component, type TemplateDecl, type ListenItem } from '@qimenjs/component-core';
import type { DemoConfig, DemoSection } from './types';

/** Menu 选中项交互演示 */
class MenuSelectDemo extends Component {
    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            style: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
            children: [
                {
                    type: 'menu',
                    name: 'menu',
                    options: {
                        eventKey: 'menu',
                        items: [
                            { text: '新建', action: 'new' },
                            { text: '打开', action: 'open' },
                            { text: '保存', action: 'save' },
                            { text: '导出', action: 'export' },
                        ],
                    },
                },
                {
                    tag: 'div',
                    name: 'result',
                    classes: 'q-demo__hint',
                    options: { text: '点击菜单项查看效果' },
                },
            ],
        };
    }

    listens: ListenItem[] = [{ source: 'menu', events: { select: '_onMenuSelect' } }];

    _onMenuSelect(data: any): void {
        const action = data?.action;
        const result = this.getNodeEl('result');
        if (result && action) {
            result.textContent = `选中: ${action}`;
        }
    }
}

export const MENU_DEMO: DemoConfig = {
    title: 'Menu',
    description: '菜单组件，支持垂直/水平布局、图标、快捷键、分组单选/多选、子菜单',
    sections: [
        {
            label: '基本菜单',
            code: `{
    type: 'menu',
    options: {
        items: [
            { text: '新建' },
            { text: '打开' },
            { text: '保存' },
        ],
    }
}`,
            template: {
                type: 'menu',
                options: {
                    items: [{ text: '新建' }, { text: '打开' }, { text: '保存' }],
                },
            },
        },
        {
            label: '带图标',
            code: `{
    type: 'menu',
    options: {
        items: [
            { text: '新建', icon: 'fa-solid fa-file-circle-plus' },
            { text: '打开', icon: 'fa-solid fa-folder-open' },
            { text: '保存', icon: 'fa-solid fa-floppy-disk' },
        ],
    }
}`,
            template: {
                type: 'menu',
                options: {
                    items: [
                        { text: '新建', icon: 'fa-solid fa-file-circle-plus' },
                        { text: '打开', icon: 'fa-solid fa-folder-open' },
                        { text: '保存', icon: 'fa-solid fa-floppy-disk' },
                    ],
                },
            },
        },
        {
            label: '带快捷键',
            code: `{
    type: 'menu',
    options: {
        items: [
            { text: '新建', shortcut: 'Ctrl+N' },
            { text: '打开', shortcut: 'Ctrl+O' },
            { text: '保存', shortcut: 'Ctrl+S' },
        ],
    }
}`,
            template: {
                type: 'menu',
                options: {
                    items: [
                        { text: '新建', shortcut: 'Ctrl+N' },
                        { text: '打开', shortcut: 'Ctrl+O' },
                        { text: '保存', shortcut: 'Ctrl+S' },
                    ],
                },
            },
        },
        {
            label: '分组单选 (radio)',
            code: `{
    type: 'menu',
    options: {
        items: [
            { text: '视图', group: 'view', groupMode: 'radio', checked: true },
            { text: '列表', group: 'view', groupMode: 'radio' },
            { text: '网格', group: 'view', groupMode: 'radio' },
        ],
    }
}`,
            template: {
                type: 'menu',
                options: {
                    items: [
                        { text: '视图', group: 'view', groupMode: 'radio', checked: true },
                        { text: '列表', group: 'view', groupMode: 'radio' },
                        { text: '网格', group: 'view', groupMode: 'radio' },
                    ],
                },
            },
        },
        {
            label: '分组多选 (checkbox)',
            code: `{
    type: 'menu',
    options: {
        items: [
            { text: '显示标尺', group: 'opt', groupMode: 'checkbox', checked: true },
            { text: '显示网格', group: 'opt', groupMode: 'checkbox' },
            { text: '显示辅助线', group: 'opt', groupMode: 'checkbox', checked: true },
        ],
    }
}`,
            template: {
                type: 'menu',
                options: {
                    items: [
                        { text: '显示标尺', group: 'opt', groupMode: 'checkbox', checked: true },
                        { text: '显示网格', group: 'opt', groupMode: 'checkbox' },
                        { text: '显示辅助线', group: 'opt', groupMode: 'checkbox', checked: true },
                    ],
                },
            },
        },
        {
            label: '3层嵌套子菜单',
            code: `{
    type: 'menu',
    options: {
        items: [
            { text: '文件', popover: { options: { items: [
                { text: '新建', popover: { options: { items: [
                    { text: '文档' },
                    { text: '图片' },
                    { text: '项目' },
                ]}}},
                { text: '打开' },
                { text: '保存' },
            ]}},
            { text: '编辑', popover: { options: { items: [
                { text: '撤销' },
                { text: '重做' },
            ]}},
            { text: '帮助' },
        ],
    }
}`,
            template: {
                type: 'menu',
                options: {
                    items: [
                        {
                            text: '文件',
                            action: 'file',
                            popover: {
                                options: {
                                    items: [
                                        {
                                            text: '新建',
                                            action: 'new',
                                            popover: {
                                                options: {
                                                    items: [
                                                        { text: '文档', action: 'new-doc' },
                                                        { text: '图片', action: 'new-image' },
                                                        { text: '项目', action: 'new-project' },
                                                    ],
                                                },
                                            },
                                        },
                                        { text: '打开', action: 'open' },
                                        { text: '保存', action: 'save' },
                                    ],
                                },
                            },
                        },
                        {
                            text: '编辑',
                            action: 'edit',
                            popover: {
                                options: {
                                    items: [
                                        { text: '撤销', action: 'undo' },
                                        { text: '重做', action: 'redo' },
                                    ],
                                },
                            },
                        },
                        { text: '帮助', action: 'help' },
                    ],
                },
            },
        },
        {
            label: '选中项交互',
            code: `// items 中每项可设置 action 字段
// select 事件中通过 data.action 获取选中项
menu.on('select', (data) => {
    console.log(data.action);
})`,
            component: MenuSelectDemo,
        } satisfies DemoSection,
    ],
};
