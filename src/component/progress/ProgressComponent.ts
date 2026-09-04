/**
 * ProgressComponent 进度条组件
 *
 * 水平进度条，支持百分比、类型色、条纹动画。
 *
 * 模板节点：
 * - bar  — 进度填充条
 * - text — 百分比文字（默认隐藏）
 *
 * @example
 * ```ts
 * new ProgressComponent({ percent: 60 })
 * new ProgressComponent({ percent: 100, progressType: 'success' })
 * new ProgressComponent({ percent: 45, striped: true })
 * ```
 */

import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@/component-core';
import { PROGRESS_TPL } from './progress-tpl';
import { Definitions } from '@/composable';
import './progress.css';

/** 进度条类型 */
export type ProgressType = 'default' | 'success' | 'warning' | 'error';

/** 进度条属性接口 */
export interface ProgressProps {
    percent?: number;
    progressType?: ProgressType;
    striped?: boolean;
    showText?: boolean;
}

const ProgressComponentDefs: Definitions = {
    options: {
        percent: 0,
        progressType: 'default',
        striped: false,
        showText: false,
    },
} as const;

class ProgressComponent extends Component {
    static type = 'progress';
    get tpl(): TemplateDecl {
        return PROGRESS_TPL;
    }

    _onPercentOptionChange(value: number): void {
        const clamped = Math.max(0, Math.min(100, value));
        this.setStyles({ width: `${clamped}%` }, 'bar');
        this.setAttributes({ 'aria-valuenow': String(clamped) });
        if (!this.hasCls('hidden', 'text')) {
            const textEl = this.getNodeEl('text');
            if (textEl) textEl.textContent = `${clamped}%`;
        }
    }

    _onProgressTypeOptionChange(value: ProgressType, old: ProgressType): void {
        if (old) this.removeCls(`q-progress--${old}`);
        if (value) this.addCls(`q-progress--${value}`);
    }

    _onStripedOptionChange(value: boolean): void {
        this.toggleCls('q-progress--striped', value);
    }

    _onShowTextOptionChange(value: boolean): void {
        this._setNodeHidden(!value, 'text');
        if (value) {
            const textEl = this.getNodeEl('text');
            if (textEl) textEl.textContent = `${this.percent}%`;
        }
    }
}

ProgressComponent.define(ProgressComponentDefs);
export { ProgressComponent };
/** 进度条实例类型 */
export type ProgressComponentInstance = InstanceType<typeof ProgressComponent>;