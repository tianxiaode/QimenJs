import { Component, type TemplateDecl, type DomEventsMap } from '@qimenjs/component-core';
import type { DemoConfig, DemoSection } from './types';

/** Pressed 交互演示组件 — 点击切换 pressed 状态 */
class ButtonPressedDemo extends Component {
    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            classes: 'q-demo__row',
            children: [
                { type: 'button', name: 'toggleBtn', options: { text: 'Click to Toggle' } },
                { type: 'button', name: 'alwaysPressed', options: { text: 'Always Pressed', pressed: true } },
            ],
        };
    }

    domEvents: DomEventsMap = {
        click: { path: 'toggleBtn', handler: '_onToggleClick' },
    };

    _onToggleClick(): void {
        const btn = this.getComponent('toggleBtn');
        if (btn) {
            btn.pressed = !btn.pressed;
            btn.text = btn.pressed ? 'Pressed State' : 'Click to Toggle';
        }
    }
}

/** Icon Align 演示组件 — 展示 icon 和 text 的四种位置关系 */
class ButtonIconAlignDemo extends Component {
    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            style: { display: 'flex', flexDirection: 'column', gap: '12px' },
            children: [
                {
                    tag: 'div',
                    classes: 'q-demo__row',
                    children: [
                        { type: 'button', options: { iconCls: 'fa-solid fa-home', text: 'Left', iconAlign: 'left' } },
                        { type: 'button', options: { iconCls: 'fa-solid fa-home', text: 'Right', iconAlign: 'right' } },
                    ],
                },
                {
                    tag: 'div',
                    classes: 'q-demo__row',
                    children: [
                        { type: 'button', options: { iconCls: 'fa-solid fa-home', text: 'Top', iconAlign: 'top' } },
                        { type: 'button', options: { iconCls: 'fa-solid fa-home', text: 'Bottom', iconAlign: 'bottom' } },
                    ],
                },
                {
                    tag: 'div',
                    classes: 'q-demo__row',
                    children: [
                        { type: 'button', options: { iconCls: 'fa-solid fa-home' } },
                        { type: 'button', options: { text: 'No Icon' } },
                    ],
                },
            ],
        };
    }
}

export const BUTTON_DEMO: DemoConfig = {
    title: 'Button',
    description: '按钮组件，支持 size/color/ghost/pressed/iconCls/iconAlign/busy/arrowCls 等 option',
    sections: [
        {
            label: 'Size',
            code: `{ type: 'button', options: { text: 'XS', size: 'xs' } }
{ type: 'button', options: { text: 'SM', size: 'sm' } }
{ type: 'button', options: { text: 'MD', size: 'md' } }
{ type: 'button', options: { text: 'LG', size: 'lg' } }
{ type: 'button', options: { text: 'XL', size: 'xl' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'button', options: { text: 'XS', size: 'xs' } },
                    { type: 'button', options: { text: 'SM', size: 'sm' } },
                    { type: 'button', options: { text: 'MD', size: 'md' } },
                    { type: 'button', options: { text: 'LG', size: 'lg' } },
                    { type: 'button', options: { text: 'XL', size: 'xl' } },
                ],
            },
        },
        {
            label: 'Color',
            code: `{ type: 'button', options: { text: 'Primary', color: 'primary' } }
{ type: 'button', options: { text: 'Secondary', color: 'secondary' } }
{ type: 'button', options: { text: 'Success', color: 'success' } }
{ type: 'button', options: { text: 'Warning', color: 'warning' } }
{ type: 'button', options: { text: 'Error', color: 'error' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'button', options: { text: 'Primary', color: 'primary' } },
                    { type: 'button', options: { text: 'Secondary', color: 'secondary' } },
                    { type: 'button', options: { text: 'Success', color: 'success' } },
                    { type: 'button', options: { text: 'Warning', color: 'warning' } },
                    { type: 'button', options: { text: 'Error', color: 'error' } },
                ],
            },
        },
        {
            label: 'Ghost (幽灵按钮)',
            code: `{ type: 'button', options: { text: 'Primary', color: 'primary', ghost: true } }
{ type: 'button', options: { text: 'Success', color: 'success', ghost: true } }
{ type: 'button', options: { text: 'Error', color: 'error', ghost: true } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'button', options: { text: 'Primary', color: 'primary', ghost: true } },
                    { type: 'button', options: { text: 'Success', color: 'success', ghost: true } },
                    { type: 'button', options: { text: 'Error', color: 'error', ghost: true } },
                ],
            },
        },
        {
            label: 'Pressed (点击切换)',
            code: `// 点击按钮切换 pressed 状态
btn.pressed = !btn.pressed;

// 静态 pressed 按钮
{ type: 'button', options: { text: 'Pressed', pressed: true } }`,
            component: ButtonPressedDemo,
        } satisfies DemoSection,
        {
            label: 'Icon (iconCls)',
            code: `{ type: 'button', options: { iconCls: 'fa-solid fa-home', text: 'Home' } }
{ type: 'button', options: { iconCls: 'fa-solid fa-gear' } }
{ type: 'button', options: { iconCls: 'fa-solid fa-trash', color: 'error' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'button', options: { iconCls: 'fa-solid fa-home', text: 'Home' } },
                    { type: 'button', options: { iconCls: 'fa-solid fa-gear' } },
                    { type: 'button', options: { iconCls: 'fa-solid fa-trash', color: 'error' } },
                ],
            },
        },
        {
            label: 'Icon Align (图标位置)',
            code: `{ type: 'button', options: { iconCls: 'fa-solid fa-home', text: 'Left', iconAlign: 'left' } }
{ type: 'button', options: { iconCls: 'fa-solid fa-home', text: 'Right', iconAlign: 'right' } }
{ type: 'button', options: { iconCls: 'fa-solid fa-home', text: 'Top', iconAlign: 'top' } }
{ type: 'button', options: { iconCls: 'fa-solid fa-home', text: 'Bottom', iconAlign: 'bottom' } }`,
            component: ButtonIconAlignDemo,
        } satisfies DemoSection,
        {
            label: 'Busy (加载状态)',
            code: `{ type: 'button', options: { text: 'Loading', busy: true } }
{ type: 'button', options: { text: 'Normal' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'button', options: { text: 'Loading', busy: true } },
                    { type: 'button', options: { text: 'Normal' } },
                ],
            },
        },
        {
            label: 'Arrow (arrowCls)',
            code: `{ type: 'button', options: { text: 'Dropdown', arrowCls: 'fa-solid fa-chevron-down' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'button', options: { text: 'Dropdown', arrowCls: 'fa-solid fa-chevron-down' } },
                ],
            },
        },
        {
            label: 'Disable',
            code: `{ type: 'button', options: { text: 'Disabled', disable: true } }
{ type: 'button', options: { text: 'Disabled Ghost', disable: true, ghost: true } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'button', options: { text: 'Disabled', disable: true } },
                    { type: 'button', options: { text: 'Disabled Ghost', disable: true, ghost: true } },
                ],
            },
        },
    ],
};
