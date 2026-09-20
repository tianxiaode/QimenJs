import type { DemoConfig } from './types';

export const NAVBAR_DEMO: DemoConfig = {
    title: 'Navbar',
    description: '响应式导航栏组件，支持 logo、公司名、items 导航项、移动端菜单',
    sections: [
        {
            label: '基本导航栏',
            code: `{
    type: 'navbar',
    options: {
        companyName: 'QimenJS',
        items: [
            { type: 'href', text: '首页', action: 'home' },
            { type: 'href', text: '文档', action: 'docs' },
            { type: 'href', text: '关于', action: 'about' },
        ],
    }
}`,
            template: {
                type: 'navbar',
                options: {
                    companyName: 'QimenJS',
                    items: [
                        { type: 'href', text: '首页', action: 'home' },
                        { type: 'href', text: '文档', action: 'docs' },
                        { type: 'href', text: '关于', action: 'about' },
                    ],
                },
            },
        },
        {
            label: '带 Logo',
            code: `{
    type: 'navbar',
    options: {
        logo: 'Q',
        companyName: 'QimenJS',
        items: [
            { type: 'href', text: '首页', action: 'home' },
            { type: 'href', text: '产品', action: 'product' },
        ],
    }
}`,
            template: {
                type: 'navbar',
                options: {
                    logo: 'Q',
                    companyName: 'QimenJS',
                    items: [
                        { type: 'href', text: '首页', action: 'home' },
                        { type: 'href', text: '产品', action: 'product' },
                    ],
                },
            },
        },
        {
            label: '带右侧按钮',
            code: `{
    type: 'navbar',
    options: {
        companyName: 'QimenJS',
        items: [
            { type: 'button', text: '登录', action: 'login', dock: 'right' },
            { type: 'button', text: '注册', action: 'register', color: 'primary', dock: 'right' },
        ],
    }
}`,
            template: {
                type: 'navbar',
                options: {
                    companyName: 'QimenJS',
                    items: [
                        { type: 'button', text: '登录', action: 'login', dock: 'right' },
                        {
                            type: 'button',
                            text: '注册',
                            action: 'register',
                            color: 'primary',
                            dock: 'right',
                        },
                    ],
                },
            },
        },
        {
            label: 'Fixed 固定导航栏',
            code: `{
    type: 'navbar',
    options: {
        companyName: 'Fixed Navbar',
        fixed: true,
        items: [
            { type: 'href', text: '首页', action: 'home' },
        ],
    }
}`,
            template: {
                type: 'navbar',
                options: {
                    companyName: 'Fixed Navbar',
                    fixed: true,
                    items: [{ type: 'href', text: '首页', action: 'home' }],
                },
            },
        },
        {
            label: '移动端菜单 (menu)',
            code: `{
    type: 'navbar',
    options: {
        companyName: 'Responsive',
        menu: {},
        items: [
            { type: 'href', text: '首页', action: 'home' },
            { type: 'href', text: '文档', action: 'docs' },
        ],
    }
}`,
            template: {
                type: 'navbar',
                options: {
                    companyName: 'Responsive',
                    menu: {},
                    items: [
                        { type: 'href', text: '首页', action: 'home' },
                        { type: 'href', text: '文档', action: 'docs' },
                        { type: 'href', text: '关于', action: 'about' },
                    ],
                },
            },
        },
    ],
};
