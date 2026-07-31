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
import { PROGRESS_TPL } from './progress-tpl';

export type ProgressType = 'default' | 'success' | 'warning' | 'error';

export interface ProgressProps {
    percent?: number;
    type?: ProgressType;
    striped?: boolean;
    showText?: boolean;
}

class ProgressComponent extends Component {
    _percent: number = 0;
    _progressType: ProgressType = 'default';

    onAfterInit(props?: ProgressProps): void {
        this._initProgress(props);
    }

    _initProgress(props?: ProgressProps): void {
        if (props?.type) {
            this._progressType = props.type;
            this.addCls(`q-progress--${props.type}`);
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
        const barEl = this.nodeMap?.bar?.el as HTMLElement | null;
        if (barEl) {
            barEl.style.width = `${this._percent}%`;
        }
        this.setAttr('aria-valuenow', String(this._percent));
        if (!this.nodeMap?.text?.el?.hidden) {
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
        if (props?.type !== undefined) this.progressType = props.type;
        if (props?.striped !== undefined) this.toggleCls('q-progress--striped', props.striped);
        if (props?.showText !== undefined) this.setNodeHidden(!props.showText, 'text');
    }
}

ProgressComponent.useTemplate(PROGRESS_TPL);
export { ProgressComponent };
export type ProgressComponentInstance = InstanceType<typeof ProgressComponent>;
