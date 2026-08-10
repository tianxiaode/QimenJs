/**
 * ProgressComponent 进度条组件
 *
 * 水平进度条，支持百分比、类型色、条纹动画。
 *
 * @example
 * ```ts
 * new ProgressComponent({ percent: 60 })
 * new ProgressComponent({ percent: 100, type: 'success' })
 * new ProgressComponent({ percent: 45, striped: true })
 * progress.percent = 80;
 * ```
 */

import { Component } from '@qimenjs/component-core';
import type { TplNode } from '@qimenjs/component-core';
import { PROGRESS_TPL } from './progress-tpl';
import './progress.css.ts';

/** 进度条类型 */
export type ProgressType = 'default' | 'success' | 'warning' | 'error';

/** 进度条属性接口 */
export interface ProgressProps {
    percent?: number;
    progresstype?: ProgressType;
    striped?: boolean;
    showText?: boolean;
}

class ProgressComponent extends Component {
    get tpl(): TplNode {
        return PROGRESS_TPL;
    }

    _percent: number = 0;
    _progressType: ProgressType = 'default';

    onAfterInit(props?: ProgressProps): void {
        this._initProgress(props);
    }

    _initProgress(props?: ProgressProps): void {
        if (props?.progresstype) {
            this._progressType = props.progresstype;
            this.addCls(`q-progress--${props.progresstype}`);
        }
        if (props?.striped) this.addCls('q-progress--striped');
        if (props?.showText) this.setNodeHidden(false, 'text');
        if (props?.percent !== undefined) this.percent = props.percent;
    }

    get percent(): number {
        return this._percent;
    }
    set percent(value: number) {
        this._percent = Math.max(0, Math.min(100, value));
        this.setNodeStyle({ width: `${this._percent}%` }, 'bar');
        this.setAttr('aria-valuenow', String(this._percent));
        if (!this._getNodeProp('text', 'hidden')) {
            this.text = `${this._percent}%`;
        }
    }

    get progressType(): ProgressType {
        return this._progressType;
    }
    set progressType(value: ProgressType) {
        this.removeCls(`q-progress--${this._progressType}`);
        this._progressType = value;
        this.addCls(`q-progress--${value}`);
    }

    update(props?: Partial<ProgressProps>): void {
        if (props?.percent !== undefined) this.percent = props.percent;
        if (props?.progresstype !== undefined) this.progressType = props.progresstype;
        if (props?.striped !== undefined) this.toggleCls('q-progress--striped', props.striped);
        if (props?.showText !== undefined) this.setNodeHidden(!props.showText, 'text');
    }
}

export { ProgressComponent };
/** 进度条实例类型 */
export type ProgressComponentInstance = InstanceType<typeof ProgressComponent>;
