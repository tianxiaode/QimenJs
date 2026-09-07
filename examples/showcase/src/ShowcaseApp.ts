import { Component, DomEventsMap, TemplateDecl } from '@qimenjs/component-core';

export class ShowcaseApp extends Component {
    get tpl(): TemplateDecl {
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
                                            options: { text: 'Card:' },
                                        },
                                        {
                                            type: 'button',
                                            name: 'btnCardPrimary',
                                            options: { text: 'Primary', color: 'primary' },
                                        },
                                        {
                                            type: 'button',
                                            name: 'btnCardPrimaryOutline',
                                            options: {
                                                text: 'Primary Outline',
                                                color: 'primary-outline',
                                            },
                                        },
                                        {
                                            type: 'button',
                                            name: 'btnCardWarning',
                                            options: { text: 'Warning', color: 'warning' },
                                        },
                                        {
                                            type: 'button',
                                            name: 'btnCardWarningOutline',
                                            options: {
                                                text: 'Warning Outline',
                                                color: 'warning-outline',
                                            },
                                        },
                                        {
                                            type: 'button',
                                            name: 'btnCardReset',
                                            options: { text: 'Reset' },
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
                                            name: 'btnPrimary',
                                            options: { text: 'Primary', color: 'primary' },
                                        },
                                        {
                                            type: 'button',
                                            name: 'btnPrimaryOutline',
                                            options: { text: 'Outline', color: 'primary-outline' },
                                        },
                                        {
                                            type: 'button',
                                            name: 'btnSuccess',
                                            options: { text: 'Success', color: 'success' },
                                        },
                                        {
                                            type: 'button',
                                            name: 'btnSuccessOutline',
                                            options: { text: 'Outline', color: 'success-outline' },
                                        },
                                        {
                                            type: 'button',
                                            name: 'btnError',
                                            options: { text: 'Error', color: 'error' },
                                        },
                                        {
                                            type: 'button',
                                            name: 'btnErrorOutline',
                                            options: { text: 'Outline', color: 'error-outline' },
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
                                            name: 'avatarPrimary',
                                            options: { text: 'P', color: 'primary' },
                                        },
                                        {
                                            type: 'avatar',
                                            name: 'avatarPrimaryOutline',
                                            options: { text: 'P', color: 'primary-outline' },
                                        },
                                        {
                                            type: 'avatar',
                                            name: 'avatarSuccess',
                                            options: { text: 'S', color: 'success' },
                                        },
                                        {
                                            type: 'avatar',
                                            name: 'avatarSuccessOutline',
                                            options: { text: 'S', color: 'success-outline' },
                                        },
                                        {
                                            type: 'avatar',
                                            name: 'avatarWarning',
                                            options: { text: 'W', color: 'warning' },
                                        },
                                        {
                                            type: 'avatar',
                                            name: 'avatarWarningOutline',
                                            options: { text: 'W', color: 'warning-outline' },
                                        },
                                        {
                                            type: 'avatar',
                                            name: 'avatarError',
                                            options: { text: 'E', color: 'error' },
                                        },
                                        {
                                            type: 'avatar',
                                            name: 'avatarErrorOutline',
                                            options: { text: 'E', color: 'error-outline' },
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

    domEvents?: DomEventsMap | undefined = {
        click: {
            btnPrimary: { handler: 'handleBtnClick' },
            btnPrimaryOutline: { handler: 'handleBtnClick' },
            btnSuccess: { handler: 'handleBtnClick' },
            btnSuccessOutline: { handler: 'handleBtnClick' },
            btnError: { handler: 'handleBtnClick' },
            btnErrorOutline: { handler: 'handleBtnClick' },
        },
    };
}
