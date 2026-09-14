import type { DemoConfig } from './types';

export const BUTTON_DEMO: DemoConfig = {
    title: 'Button',
    description: '按钮组件，支持 size/color/outline/disabled/pressed 等 option',
    sections: [
        {
            label: 'Size',
            code: `{ type: 'button', options: { text: 'Small', size: 'sm' } }
{ type: 'button', options: { text: 'Medium', size: 'md' } }
{ type: 'button', options: { text: 'Large', size: 'lg' } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'button', options: { text: 'Small', size: 'sm' } },
                    { type: 'button', options: { text: 'Medium', size: 'md' } },
                    { type: 'button', options: { text: 'Large', size: 'lg' } },
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
            label: 'Outline',
            code: `{ type: 'button', options: { text: 'Primary', color: 'primary', outline: true } }
{ type: 'button', options: { text: 'Success', color: 'success', outline: true } }
{ type: 'button', options: { text: 'Error', color: 'error', outline: true } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'button', options: { text: 'Primary', color: 'primary', outline: true } },
                    { type: 'button', options: { text: 'Success', color: 'success', outline: true } },
                    { type: 'button', options: { text: 'Error', color: 'error', outline: true } },
                ],
            },
        },
        {
            label: 'Disabled',
            code: `{ type: 'button', options: { text: 'Disabled', disabled: true } }
{ type: 'button', options: { text: 'Disabled Outline', disabled: true, outline: true } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'button', options: { text: 'Disabled', disabled: true } },
                    { type: 'button', options: { text: 'Disabled Outline', disabled: true, outline: true } },
                ],
            },
        },
        {
            label: 'Pressed (两态按钮)',
            code: `{ type: 'button', options: { text: 'Normal' } }
{ type: 'button', options: { text: 'Pressed', pressed: true } }`,
            template: {
                tag: 'div',
                classes: 'q-demo__row',
                children: [
                    { type: 'button', options: { text: 'Normal' } },
                    { type: 'button', options: { text: 'Pressed', pressed: true } },
                ],
            },
        },
    ],
};
