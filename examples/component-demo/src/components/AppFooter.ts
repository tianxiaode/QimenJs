/**
 * AppFooter - 应用底部组件
 *
 * 简单的版权信息和版本展示。
 */

import { Component } from '@qimenjs/component-core';

export let AppFooterComponent = Component.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-app-footer',
        flex: { direction: 'row', align: 'center', pack: 'center' },
        children: [
            { tag: 'span', name: 'text' },
        ],
    },
    body: {
        type: 'AppFooter',

        onAfterInit(): void {
            const year = new Date().getFullYear();
            this.text = `QimenJS Component Demo © ${year} — 基于 QimenJS 组件框架构建`;
        },
    },
});

export type AppFooterComponent = InstanceType<typeof AppFooterComponent>;