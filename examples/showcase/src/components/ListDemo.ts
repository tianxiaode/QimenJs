import type { DemoConfig } from './types';

export const LIST_DEMO: DemoConfig = {
    title: 'List',
    description: '列表组件，支持状态色、6种标记形态（dot/dash/ring/square/check/cross）、描述文本',
    sections: [
        {
            label: '基础列表',
            code: `{ type: 'list', options: { items: [{ label: '项目1' }, { label: '项目2' }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'list',
                        options: {
                            items: [
                                { label: '服务器运行中' },
                                { label: '数据库已连接' },
                                { label: '缓存正常' },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '状态色 (status)',
            code: `{ type: 'list', options: { items: [{ label: '...', status: 'success | warning | error' }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'list',
                        options: {
                            items: [
                                { label: '服务器运行中', status: 'success' },
                                { label: '磁盘空间不足', status: 'warning' },
                                { label: '连接已断开', status: 'error' },
                                { label: '常规信息', status: 'default' },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '标记形态 (markForm)',
            code: `{ type: 'list', options: { items: [{ label: '...', markForm: 'dot | dash | ring | square | check | cross' }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'list',
                        options: {
                            items: [
                                { label: '圆点标记 (dot)', markForm: 'dot', status: 'success' },
                                { label: '短线标记 (dash)', markForm: 'dash', status: 'warning' },
                                { label: '圆环标记 (ring)', markForm: 'ring', status: 'error' },
                                { label: '方框标记 (square)', markForm: 'square', status: 'primary' },
                                { label: '对勾标记 (check)', markForm: 'check' },
                                { label: '错叉标记 (cross)', markForm: 'cross' },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '任务状态列表 (check/cross)',
            code: `{ type: 'list', options: { items: [{ label: '...', markForm: 'check | cross' }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'list',
                        options: {
                            items: [
                                { label: '代码编译', markForm: 'check', description: '编译成功，无错误' },
                                { label: '单元测试', markForm: 'check', description: '128 个测试全部通过' },
                                { label: '集成测试', markForm: 'cross', description: '3 个测试失败，需要修复' },
                                { label: '部署预发环境', markForm: 'cross', description: '部署超时，需重试' },
                                { label: '文档更新', markForm: 'square', description: '待处理' },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '带描述 (description)',
            code: `{ type: 'list', options: { items: [{ label: '...', description: '...' }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'list',
                        options: {
                            items: [
                                {
                                    label: 'CPU 使用率',
                                    description: '当前使用率 45%，正常运行',
                                    status: 'success',
                                },
                                {
                                    label: '内存使用率',
                                    description: '当前使用率 82%，接近上限',
                                    status: 'warning',
                                },
                                {
                                    label: '磁盘空间',
                                    description: '剩余空间不足 5%，需要清理',
                                    status: 'error',
                                },
                            ],
                        },
                    },
                ],
            },
        },
        {
            label: '完整列表（状态 + 标记 + 描述）',
            code: `{ type: 'list', options: { items: [{ label: '...', status: '...', markForm: '...', description: '...' }] } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    {
                        type: 'list',
                        options: {
                            items: [
                                {
                                    label: 'API 服务',
                                    description: '响应时间 120ms，正常',
                                    status: 'success',
                                    markForm: 'check',
                                },
                                {
                                    label: '数据库连接',
                                    description: '连接数接近上限',
                                    status: 'warning',
                                    markForm: 'ring',
                                },
                                {
                                    label: '消息队列',
                                    description: '队列积压 5000+，处理异常',
                                    status: 'error',
                                    markForm: 'cross',
                                },
                                {
                                    label: '定时任务',
                                    description: '尚未执行，等待调度',
                                    status: 'default',
                                    markForm: 'square',
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
