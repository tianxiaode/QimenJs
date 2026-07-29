interface NavItem {
    label: string;
    path: string;
    icon?: string;
}

export const APP_HEADER_TPL = {
    tag: 'div',
    cls: 'q-app-header',
    flex: { direction: 'row', align: 'center', gap: '24px' },
    children: [
        {
            tag: 'div',
            name: 'logo',
            cls: 'q-app-header__logo',
            flex: { direction: 'row', align: 'center', gap: '8px' },
            events: { click: { handler: true } },
            children: [
                { tag: 'i', cls: 'fa-solid fa-qi' },
                { tag: 'span', name: 'logoText' },
            ],
        },
        {
            tag: 'div',
            name: 'nav',
            cls: 'q-app-header__nav',
            flex: { direction: 'row', align: 'center', gap: '4px' },
        },
        {
            tag: 'div',
            name: 'actions',
            cls: 'q-app-header__actions',
            flex: { direction: 'row', align: 'center', gap: '8px' },
        },
    ],
};

export const NAV_ITEMS: NavItem[] = [
    { label: '首页', path: '/', icon: 'fa-solid fa-house' },
    { label: '组件', path: '/components', icon: 'fa-solid fa-cubes' },
    { label: '模板', path: '/templates', icon: 'fa-solid fa-layer-group' },
];

export const LANGUAGE_OPTIONS = [
    { value: 'zh-CN', label: '中文' },
    { value: 'en-US', label: 'English' },
];

export const THEME_OPTIONS = [
    { value: 'light', label: '亮色' },
    { value: 'dark', label: '暗色' },
];
