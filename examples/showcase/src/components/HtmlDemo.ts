import type { DemoConfig } from './types';

export const HTML_DEMO: DemoConfig = {
    title: 'Html',
    description: 'HTML 内容组件，通过 content option 设置原始 HTML+',
    sections: [
        {
            label: '纯文本内容',
            code: `{ type: 'html', options: { content: 'Hello World' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'html', options: { content: 'Hello World' } },
                ],
            },
        },
        {
            label: '富文本 HTML',
            code: `{ type: 'html', options: { content: '<strong>加粗</strong> <em>斜体</em> <u>下划线</u>' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'html',
                        options: {
                            content: '<strong>加粗</strong> <em>斜体</em> <u>下划线</u>',
                        },
                    },
                ],
            },
        },
        {
            label: '列表与链接',
            code: `{ type: 'html', options: { content: '<ul><li>项目一</li><li>项目二</li></ul><a href="#">链接</a>' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'html',
                        options: {
                            content:
                                '<ul><li>项目一</li><li>项目二</li></ul><a href="#">链接</a>',
                        },
                    },
                ],
            },
        },
        {
            label: '数组内容（自动拼接）',
            code: `{ type: 'html', options: { content: ['<p>第一段</p>', '<p>第二段</p>'] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'html',
                        options: { content: ['<p>第一段</p>', '<p>第二段</p>'] },
                    },
                ],
            },
        },
        {
            label: '表格 HTML',
            code: `{ type: 'html', options: { content: '<table border="1"><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></table>' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'html',
                        options: {
                            content:
                                '<table border="1"><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></table>',
                        },
                    },
                ],
            },
        },
    ],
};
