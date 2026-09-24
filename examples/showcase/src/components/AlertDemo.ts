import type { DemoConfig } from './types';

export const ALERT_DEMO: DemoConfig = {
    title: 'Alert',
    description: '页面内提示条组件，支持类型色（info/success/warning/error）、标题、可关闭',
    sections: [
        {
            label: '基础提示 (info)',
            code: `{ type: 'alert', options: { text: '这是一条信息提示', alertType: 'info' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'alert',
                        options: { text: '这是一条信息提示', alertType: 'info' },
                    },
                ],
            },
        },
        {
            label: '成功提示 (success)',
            code: `{ type: 'alert', options: { text: '操作成功完成', alertType: 'success' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'alert',
                        options: { text: '操作成功完成', alertType: 'success' },
                    },
                ],
            },
        },
        {
            label: '警告提示 (warning)',
            code: `{ type: 'alert', options: { text: '请注意潜在风险', alertType: 'warning' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'alert',
                        options: { text: '请注意潜在风险', alertType: 'warning' },
                    },
                ],
            },
        },
        {
            label: '错误提示 (error)',
            code: `{ type: 'alert', options: { text: '操作失败，请重试', alertType: 'error' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'alert',
                        options: { text: '操作失败，请重试', alertType: 'error' },
                    },
                ],
            },
        },
        {
            label: '带标题 (title)',
            code: `{ type: 'alert', options: { title: '系统通知', text: '系统将于今晚进行维护', alertType: 'warning' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'alert',
                        options: {
                            title: '系统通知',
                            text: '系统将于今晚进行维护',
                            alertType: 'warning',
                        },
                    },
                ],
            },
        },
        {
            label: '不可关闭 (closable: false)',
            code: `{ type: 'alert', options: { text: '此提示不可关闭', alertType: 'info', closable: false } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'alert',
                        options: { text: '此提示不可关闭', alertType: 'info', closable: false },
                    },
                ],
            },
        },
        {
            label: '四种类型对比',
            code: `{ type: 'alert', options: { text: '...', alertType: 'info | success | warning | error' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__col',
                style: { gap: '8px' },
                children: [
                    {
                        type: 'alert',
                        options: { text: '信息提示 (info)', alertType: 'info' },
                    },
                    {
                        type: 'alert',
                        options: { text: '成功提示 (success)', alertType: 'success' },
                    },
                    {
                        type: 'alert',
                        options: { text: '警告提示 (warning)', alertType: 'warning' },
                    },
                    {
                        type: 'alert',
                        options: { text: '错误提示 (error)', alertType: 'error' },
                    },
                ],
            },
        },
    ],
};
