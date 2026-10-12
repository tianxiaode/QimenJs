import type { DemoConfig } from './types';

/** 生成图标网格模板：图标 + 名字 */
function gallery(icons: string[]): any {
    return {
        tag: 'div',
        classes: 'q-icons-gallery',
        children: icons.map(icon => ({
            tag: 'div',
            classes: 'q-icons-gallery__item',
            children: [
                { type: 'icon', options: { iconCls: `q-icon-${icon}` } },
                { tag: 'span', classes: 'q-icons-gallery__name', options: { text: icon } },
            ],
        })),
    };
}

export const ICONS_DEMO: DemoConfig = {
    title: '图标库',
    description:
        'QimenJS 内置图标集（楷体笔画风格，SVG + 字体双通道），通过 iconCls 指定 q-icon-{name} 类名使用',
    sections: [
        {
            label: '状态确认',
            template: gallery(['check', 'close', 'add', 'minus']),
        },
        {
            label: 'Checkbox/Radio',
            template: gallery(['checkbox', 'checkbox-check', 'radio', 'radio-check']),
        },
        {
            label: '搜索/筛选',
            template: gallery(['search', 'filter']),
        },
        {
            label: '方向箭头',
            template: gallery(['arrow-down', 'arrow-up', 'arrow-left', 'arrow-right']),
        },
        {
            label: 'V字箭头',
            template: gallery(['chevron-down', 'chevron-up', 'chevron-left', 'chevron-right']),
        },
        {
            label: '展开标记（实心）',
            template: gallery(['caret-down', 'caret-up', 'caret-left', 'caret-right']),
        },
        {
            label: '编辑操作',
            template: gallery(['edit', 'delete', 'save', 'folder-open']),
        },
        {
            label: '设置/菜单',
            template: gallery(['settings', 'menu', 'more']),
        },
        {
            label: '导航',
            template: gallery(['home', 'refresh']),
        },
        {
            label: '用户/情感',
            template: gallery(['user', 'heart', 'star']),
        },
        {
            label: '状态提示',
            template: gallery(['warning', 'info']),
        },
        {
            label: '天体/世界',
            template: gallery(['sun', 'moon', 'globe']),
        },
    ],
};
