/**
 * LoadingComponent 加载浮层组件
 *
 * 纯渲染组件，由 OverlayDispatchCenter 创建和管理生命周期。
 * 调度中心负责：定位计算、z-index 管理、OverlayRoot 挂载/卸载、遮罩管理。
 * LoadingComponent 只负责：渲染 spinner + 提示文字。
 *
 * 使用方式：
 * overlays: {
 *     myLoading: {
 *         type: 'loading',
 *         trigger: 'manual',
 *         mask: 'rgba(255, 255, 255, 0.7)',
 *         placement: 'center',
 *         data: { text: '加载中...', spinner: 'ring' }
 *     }
 * }
 *
 * onOverlayChange(data) 默认实现：通过自动生成的 text/hidden 属性更新。
 */

import { Component } from '@qimenjs/component-core';

export let LoadingComponent = Component.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-loading',
        children: [
            { tag: 'div', name: 'spinner', cls: 'q-loading-spinner' },
            { tag: 'div', name: 'text', cls: 'q-loading-text' },
        ],
    },
    body: {
        type: 'loading',

        _initLoading(props?: Record<string, any>): void {
            if (props?.text) {
                this.text = props.text;
            } else {
                this.setNodeHidden(true, 'text');
            }

            if (props?.spinner) {
                const spinnerEl = this.nodeMap?.spinner?.el;
                if (spinnerEl) {
                    spinnerEl.className = `q-loading-spinner q-loading-spinner--${props.spinner}`;
                }
            }
        },

        onOverlayChange(data: any): void {
            if (!data) return;
            if (data.text !== undefined) {
                this.text = data.text;
                this.setNodeHidden(!data.text, 'text');
            }
            if (data.visible !== undefined) {
                this.hidden = !data.visible;
            }
        },
    },
});
