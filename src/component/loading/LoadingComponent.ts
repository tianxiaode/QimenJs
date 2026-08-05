/**
 * LoadingComponent 加载浮层组件
 *
 * 纯渲染组件，由 OverlayDispatchCenter 创建和管理生命周期。
 * LoadingComponent 只负责：渲染 spinner + 提示文字。
 */

import { Component } from '@qimenjs/component-core';
import { LOADING_TPL } from './loading-tpl';

class LoadingComponent extends Component {
    _initLoading(props?: Record<string, any>): void {
        if (props?.text) {
            this.text = props.text;
        } else {
            this.setNodeHidden(true, 'text');
        }

        if (props?.spinner) {
            this.setNodeCls(`q-loading-spinner q-loading-spinner--${props.spinner}`, 'spinner');
        }
    }

    onOverlayChange(data: any): void {
        if (!data) return;
        if (data.text !== undefined) {
            this.text = data.text;
            this.setNodeHidden(!data.text, 'text');
        }
        if (data.visible !== undefined) {
            this.hidden = !data.visible;
        }
    }
}

LoadingComponent.useTemplate(LOADING_TPL);
export { LoadingComponent };
export type LoadingComponentInstance = InstanceType<typeof LoadingComponent>;
