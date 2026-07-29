/**
 * IndicatorDotComponent 指示器圆点子项组件
 *
 * 轻量指示项，作为 IndicatorComponent 的 defaultItemType 使用。
 * 支持 dot/number/dash 三种显示模式。
 */

import { Component } from '@qimenjs/component-core';

export interface IndicatorDotProps {
    index?: number;
    mode?: 'dot' | 'number' | 'dash';
}

class IndicatorDotComponent extends Component {
    _index: number = 0;
    _mode: 'dot' | 'number' | 'dash' = 'dot';

    onAfterInit(props?: IndicatorDotProps): void {
        if (props?.index !== undefined) this._index = props.index;
        if (props?.mode) this._mode = props.mode;

        this.addCls('q-indicator__item');
        this.addCls(`q-indicator__item--${this._mode}`);

        if (this._mode === 'number') {
            this.text = String(this._index + 1);
        }
    }

    update(props?: Partial<IndicatorDotProps>): void {
        if (props?.mode !== undefined) {
            this.removeCls(`q-indicator__item--${this._mode}`);
            this._mode = props.mode;
            this.addCls(`q-indicator__item--${this._mode}`);
        }
    }
}

export { IndicatorDotComponent };
export type IndicatorDotComponentInstance = InstanceType<typeof IndicatorDotComponent>;
