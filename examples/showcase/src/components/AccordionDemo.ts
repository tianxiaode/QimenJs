import type { DemoConfig } from './types';

export const ACCORDION_DEMO: DemoConfig = {
    title: 'Accordion',
    description: '手风琴组件，支持单展开/多展开模式、展开索引控制、Panel 子项',
    sections: [
        {
            label: '基础手风琴 (single mode)',
            code: `{ type: 'accordion', options: { mode: 'single', items: [{ title: '面板1', body: '内容1' }, { title: '面板2', body: '内容2' }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'accordion',
                        options: {
                            mode: 'single',
                            items: [
                                { title: '面板1', body: '面板1的内容区域' },
                                { title: '面板2', body: '面板2的内容区域' },
                                { title: '面板3', body: '面板3的内容区域' },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '默认展开 (expandedIndex)',
            code: `{ type: 'accordion', options: { mode: 'single', expandedIndex: 1, items: [...] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'accordion',
                        options: {
                            mode: 'single',
                            expandedIndex: 1,
                            items: [
                                { title: '面板A', body: '面板A的内容' },
                                { title: '面板B（默认展开）', body: '面板B的内容' },
                                { title: '面板C', body: '面板C的内容' },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '单展开（只打开一个，其余折叠）',
            code: `{ type: 'accordion', options: { mode: 'single', expandedIndex: 0, items: [...] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'accordion',
                        options: {
                            mode: 'single',
                            expandedIndex: 0,
                            items: [
                                { title: '面板1（展开）', body: '此面板默认展开，其余面板处于折叠状态' },
                                { title: '面板2（折叠）', body: '面板2的内容' },
                                { title: '面板3（折叠）', body: '面板3的内容' },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '多展开模式 (multiple)',
            code: `{ type: 'accordion', options: { mode: 'multiple', expandedIndices: [0, 2], items: [...] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'accordion',
                        options: {
                            mode: 'multiple',
                            expandedIndices: [0, 2],
                            items: [
                                { title: '面板1（展开）', body: '面板1的内容' },
                                { title: '面板2', body: '面板2的内容' },
                                { title: '面板3（展开）', body: '面板3的内容' },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '可折叠面板 (expandable)',
            code: `{ type: 'accordion', options: { items: [{ title: '折叠面板', expandable: true, body: '...' }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'accordion',
                        options: {
                            mode: 'single',
                            items: [
                                { title: '可折叠面板', expandable: true, body: '此面板支持折叠/展开操作' },
                                { title: '普通面板', expandable: true, body: '另一个可折叠面板' },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '可关闭面板 (closable)',
            code: `{ type: 'accordion', options: { items: [{ title: '可关闭', closable: true, body: '...' }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'accordion',
                        options: {
                            mode: 'single',
                            items: [
                                { title: '可关闭面板', closable: true, body: '点击关闭按钮可移除此面板' },
                                { title: '普通面板', body: '不可关闭的面板' },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
