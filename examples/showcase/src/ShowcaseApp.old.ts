/**
 * ShowcaseApp 旧模板备份 — 临时参考，不再使用
 *
 * 原 ShowcaseApp.ts 的完整模板和事件处理逻辑，改造为 navbar + 页面内容区架构前的版本。
 */
import { Component, DomEventsMap, TemplateDecl } from '@qimenjs/component-core';
import { ToolbarComponent } from '@qimenjs/component';

export class ShowcaseAppOld extends Component {
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
                                                    { text: 'Primary', color: 'primary', action: 'color-primary' },
                                                    { text: 'P-Out', color: 'primary-outline', action: 'color-primary-outline' },
                                                    { text: 'Secondary', color: 'secondary', action: 'color-secondary' },
                                                    { text: 'S-Out', color: 'secondary-outline', action: 'color-secondary-outline' },
                                                    { text: 'Success', color: 'success', action: 'color-success' },
                                                    { text: 'Su-Out', color: 'success-outline', action: 'color-success-outline' },
                                                    { text: 'Warning', color: 'warning', action: 'color-warning' },
                                                    { text: 'W-Out', color: 'warning-outline', action: 'color-warning-outline' },
                                                    { text: 'Error', color: 'error', action: 'color-error' },
                                                    { text: 'E-Out', color: 'error-outline', action: 'color-error-outline' },
                                                    { text: 'Info', color: 'info', action: 'color-info' },
                                                    { text: 'I-Out', color: 'info-outline', action: 'color-info-outline' },
                                                    { text: 'Reset', action: 'reset' },
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
                                                    { type: 'button', text: 'XS', action: 'size-xs' },
                                                    { type: 'button', text: 'SM', action: 'size-sm' },
                                                    { type: 'button', text: 'MD', action: 'size-md' },
                                                    { type: 'button', text: 'LG', action: 'size-lg' },
                                                    { type: 'button', text: 'XL', action: 'size-xl' },
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
                                        { type: 'avatar', name: 'demoAvatar', options: { text: 'Q', color: 'primary', size: 'md' } },
                                        { type: 'avatar', name: 'demoAvatarSrc', options: { src: 'https://api.dicebear.com/7.x/initials/svg?seed=QJ', size: 'md' } },
                                        { type: 'avatar', name: 'demoAvatarIcon', options: { iconCls: 'fas fa-search', color: 'success', size: 'md' } },
                                    ],
                                },
                            ],
                        },
                    },
                },
            ],
        };
    }

    domEvents: DomEventsMap | undefined = {
        click: [
            { path: 'colorCard.[body].colorToolbar.[items]', handler: { default: '_onColorToolbarClick', reset: '_onResetClick' } },
            { path: 'colorCard.[body].sizeToolbar.[items]', handler: '_onSizeToolbarClick' },
        ],
    };

    _onResetClick(_domEvt: any): void {
        const card = this.getComponent('colorCard') as any;
        const avatar = this.getComponent('demoAvatar') as any;
        if (card) card.color = null;
        if (avatar) avatar.color = null;
    }

    _onColorToolbarClick(domEvt: any): void {
        const targetComponent = domEvt?.targetComponent;
        if (!targetComponent || targetComponent.type !== 'button') return;
        const action = targetComponent.action;
        if (!action) return;
        const card = this.getComponent('colorCard') as any;
        const colorValue = action === 'color-reset' ? null : action.slice(6);
        if (card) card.color = colorValue;
        const body = card?.body as any;
        for (const name of ['demoAvatar', 'demoAvatarIcon']) {
            const av = body.getComponent(name) as any;
            if (av) av.color = colorValue;
        }
    }

    _onSizeToolbarClick(domEvt: any): void {
        const targetComponent = domEvt?.targetComponent;
        if (!targetComponent || targetComponent.type !== 'button') return;
        const action = targetComponent.action;
        if (!action) return;
        const sizeValue = action.slice(5);
        const card = this.getComponent('colorCard') as any;
        const body = card?.body as any;
        for (const name of ['demoAvatar', 'demoAvatarSrc', 'demoAvatarIcon']) {
            const av = body.getComponent(name) as any;
            if (av) av.size = sizeValue;
        }
    }
}
