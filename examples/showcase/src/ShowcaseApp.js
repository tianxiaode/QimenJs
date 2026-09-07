import { Component } from '@qimenjs/component-core';
import { ToolbarComponent } from '@qimenjs/component';
export class ShowcaseApp extends Component {
    constructor() {
        super(...arguments);
        this.domEvents = {
            click: {
                colorToolbar: { handler: '_onButtonClick' },
            },
        };
    }
    get tpl() {
        return {
            tag: 'div',
            name: 'root',
            classes: 'q-showcase',
            style: {
                padding: '40px',
                fontFamily: 'sans-serif',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
            },
            children: [
                {
                    type: 'card',
                    name: 'colorCard',
                    options: {
                        title: '颜色方案演示',
                        body: {
                            tag: 'div',
                            classes: 'q-showcase__color-demo',
                            style: { display: 'flex', flexDirection: 'column', gap: '16px' },
                            children: [
                                {
                                    tag: 'div',
                                    style: { display: 'flex', gap: '8px', alignItems: 'center' },
                                    children: [
                                        {
                                            tag: 'span',
                                            style: { fontSize: '13px', width: '80px' },
                                            options: { text: 'Color:' },
                                        },
                                        {
                                            type: ToolbarComponent,
                                            name: 'colorToolbar',
                                            options: {
                                                gap: '4px',
                                                style: {
                                                    borderBottom: 'none',
                                                    padding: '0',
                                                },
                                                defaultItemType: 'button',
                                                items: [
                                                    {
                                                        text: 'Primary',
                                                        color: 'primary',
                                                        action: 'color-primary',
                                                    },
                                                    {
                                                        text: 'P-Out',
                                                        color: 'primary-outline',
                                                        action: 'color-primary-outline',
                                                    },
                                                    {
                                                        text: 'Secondary',
                                                        color: 'secondary',
                                                        action: 'color-secondary',
                                                    },
                                                    {
                                                        text: 'S-Out',
                                                        color: 'secondary-outline',
                                                        action: 'color-secondary-outline',
                                                    },
                                                    {
                                                        text: 'Success',
                                                        color: 'success',
                                                        action: 'color-success',
                                                    },
                                                    {
                                                        text: 'Su-Out',
                                                        color: 'success-outline',
                                                        action: 'color-success-outline',
                                                    },
                                                    {
                                                        text: 'Warning',
                                                        color: 'warning',
                                                        action: 'color-warning',
                                                    },
                                                    {
                                                        text: 'W-Out',
                                                        color: 'warning-outline',
                                                        action: 'color-warning-outline',
                                                    },
                                                    {
                                                        text: 'Error',
                                                        color: 'error',
                                                        action: 'color-error',
                                                    },
                                                    {
                                                        text: 'E-Out',
                                                        color: 'error-outline',
                                                        action: 'color-error-outline',
                                                    },
                                                    {
                                                        text: 'Info',
                                                        color: 'info',
                                                        action: 'color-info',
                                                    },
                                                    {
                                                        text: 'I-Out',
                                                        color: 'info-outline',
                                                        action: 'color-info-outline',
                                                    },
                                                    {
                                                        text: 'Reset',
                                                        action: 'color-reset',
                                                    },
                                                ],
                                            },
                                        },
                                    ],
                                },
                                {
                                    tag: 'div',
                                    style: { display: 'flex', gap: '8px', alignItems: 'center' },
                                    children: [
                                        {
                                            tag: 'span',
                                            style: { fontSize: '13px', width: '80px' },
                                            options: { text: 'Size:' },
                                        },
                                        {
                                            type: ToolbarComponent,
                                            name: 'sizeToolbar',
                                            options: {
                                                gap: '4px',
                                                style: {
                                                    background: 'transparent',
                                                    borderBottom: 'none',
                                                    padding: '0',
                                                },
                                                items: [
                                                    {
                                                        type: 'button',
                                                        text: 'XS',
                                                        action: 'size-xs',
                                                    },
                                                    {
                                                        type: 'button',
                                                        text: 'SM',
                                                        action: 'size-sm',
                                                    },
                                                    {
                                                        type: 'button',
                                                        text: 'MD',
                                                        action: 'size-md',
                                                    },
                                                    {
                                                        type: 'button',
                                                        text: 'LG',
                                                        action: 'size-lg',
                                                    },
                                                    {
                                                        type: 'button',
                                                        text: 'XL',
                                                        action: 'size-xl',
                                                    },
                                                ],
                                            },
                                        },
                                    ],
                                },
                                {
                                    tag: 'div',
                                    style: { display: 'flex', gap: '8px', alignItems: 'center' },
                                    children: [
                                        {
                                            tag: 'span',
                                            style: { fontSize: '13px', width: '80px' },
                                            options: { text: 'Avatar:' },
                                        },
                                        {
                                            type: 'avatar',
                                            name: 'demoAvatar',
                                            options: { text: 'Q', color: 'primary', size: 'md' },
                                        },
                                    ],
                                },
                                {
                                    tag: 'div',
                                    style: { display: 'flex', gap: '8px', alignItems: 'center' },
                                    children: [
                                        {
                                            tag: 'span',
                                            style: { fontSize: '13px', width: '80px' },
                                            options: { text: 'Button:' },
                                        },
                                        {
                                            type: 'button',
                                            options: { text: 'Primary', color: 'primary' },
                                        },
                                        {
                                            type: 'button',
                                            options: { text: 'Outline', color: 'primary-outline' },
                                        },
                                        {
                                            type: 'button',
                                            options: { text: 'Success', color: 'success' },
                                        },
                                        {
                                            type: 'button',
                                            options: { text: 'Outline', color: 'success-outline' },
                                        },
                                        {
                                            type: 'button',
                                            options: { text: 'Error', color: 'error' },
                                        },
                                        {
                                            type: 'button',
                                            options: { text: 'Outline', color: 'error-outline' },
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                },
            ],
        };
    }
    _onButtonClick(domEvt, targetComponent) {
        if (!targetComponent || targetComponent.type !== 'button')
            return;
        const action = targetComponent.action;
        if (!action)
            return;
        const card = this.getComponent('colorCard');
        const avatar = this.getComponent('demoAvatar');
        if (action.startsWith('color-')) {
            const colorValue = action === 'color-reset' ? null : action.slice(6);
            if (card)
                card.color = colorValue;
            if (avatar)
                avatar.color = colorValue;
        }
        else if (action.startsWith('size-')) {
            const sizeValue = action.slice(5);
            if (avatar)
                avatar.size = sizeValue;
        }
    }
}
