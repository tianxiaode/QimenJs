/**
 * StatisticComponent 统计数值组件
 *
 * 展示单个统计结果：标题 + 数值 + 前缀/后缀 + 趋势指示。
 * 常用于仪表盘、概览卡片等场景。
 *
 * 模板节点：
 * - icon       — 图标（可选）
 * - title      — 标题
 * - prefix     — 前缀（如 ¥、$）
 * - value      — 数值
 * - suffix     — 后缀（如 %、个、万）
 * - trend      — 趋势指示（up/down + 文本）
 *
 * @example
 * ```ts
 * new StatisticComponent({ title: '总销售额', value: 128930, prefix: '¥', format: '#,##0.00' })
 * new StatisticComponent({ title: '增长率', value: 12.5, suffix: '%', trend: 'up' })
 * ```
 */

import { Component } from '@qimenjs/component-core';
import { STATISTIC_TPL } from './statistic-tpl';
import { formatNumber } from '@/utils/number';

export type StatisticTrend = 'up' | 'down' | 'flat';

export interface StatisticProps {
    title?: string;
    value?: number | string;
    prefix?: string;
    suffix?: string;
    format?: string;
    precision?: number;
    trend?: StatisticTrend;
    trendText?: string;
    icon?: string;
    i18n?: boolean;
}

class StatisticComponent extends Component {
    _title: string = '';
    _value: number | string = '';
    _prefix: string = '';
    _suffix: string = '';
    _format: string = '';
    _precision: number | undefined = undefined;
    _trend: StatisticTrend = 'flat';
    _trendText: string = '';

    onAfterInit(props?: StatisticProps): void {
        this.update(props);
    }

    onLocaleChange(): void {
        this._applyTitle();
        if (this._format) this._applyValue();
    }

    update(props?: Partial<StatisticProps>): void {
        if (props?.title !== undefined) {
            this._title = props.title;
            this._applyTitle();
        }
        if (props?.value !== undefined) {
            this._value = props.value;
            this._applyValue();
        }
        if (props?.prefix !== undefined) {
            this._prefix = props.prefix;
            this._applyPrefix();
        }
        if (props?.suffix !== undefined) {
            this._suffix = props.suffix;
            this._applySuffix();
        }
        if (props?.format !== undefined) this._format = props.format;
        if (props?.precision !== undefined) this._precision = props.precision;
        if (props?.trend !== undefined) {
            this._trend = props.trend;
            this._applyTrend();
        }
        if (props?.trendText !== undefined) {
            this._trendText = props.trendText;
            this._applyTrend();
        }
        if (props?.icon !== undefined) this._applyIcon(props.icon);
    }

    private _applyTitle(): void {
        this.setNodeProp('text', this._title, 'title');
    }

    private _applyValue(): void {
        let display: string;
        if (typeof this._value === 'number') {
            if (this._format) {
                display = formatNumber(this._value, this._format);
            } else if (this._precision !== undefined) {
                const fmt = `#,##0.${'0'.repeat(this._precision)}`;
                display = formatNumber(this._value, fmt);
            } else {
                display = String(this._value);
            }
        } else {
            display = this._value;
        }
        this.setNodeProp('text', display, 'value');
    }

    private _applyPrefix(): void {
        this.setNodeProp('text', this._prefix, 'prefix');
        this.setNodeHidden(!this._prefix, 'prefix');
    }

    private _applySuffix(): void {
        this.setNodeProp('text', this._suffix, 'suffix');
        this.setNodeHidden(!this._suffix, 'suffix');
    }

    private _applyTrend(): void {
        const trendEl = this._resolveNodeEl('trend');
        if (!trendEl) return;

        if (this._trend === 'flat' && !this._trendText) {
            trendEl.hidden = true;
            return;
        }

        trendEl.hidden = false;
        trendEl.className = 'q-statistic__trend';
        if (this._trend !== 'flat') {
            trendEl.classList.add(`q-statistic__trend--${this._trend}`);
        }
        const arrow = this._trend === 'up' ? '▲' : this._trend === 'down' ? '▼' : '';
        trendEl.textContent = this._trendText ? `${arrow} ${this._trendText}` : arrow;
    }

    private _applyIcon(icon?: string): void {
        if (icon) {
            this.setNodeProp('text', icon, 'icon');
            this.setNodeHidden(false, 'icon');
        } else {
            this.setNodeHidden(true, 'icon');
        }
    }

    get title(): string {
        return this._title;
    }
    set title(v: string) {
        this._title = v;
        this._applyTitle();
    }

    get value(): number | string {
        return this._value;
    }
    set value(v: number | string) {
        this._value = v;
        this._applyValue();
    }

    get prefix(): string {
        return this._prefix;
    }
    set prefix(v: string) {
        this._prefix = v;
        this._applyPrefix();
    }

    get suffix(): string {
        return this._suffix;
    }
    set suffix(v: string) {
        this._suffix = v;
        this._applySuffix();
    }

    get trend(): StatisticTrend {
        return this._trend;
    }
    set trend(v: StatisticTrend) {
        this._trend = v;
        this._applyTrend();
    }
}

StatisticComponent.useTemplate(STATISTIC_TPL);
StatisticComponent.register();
export { StatisticComponent };
export type StatisticComponentInstance = InstanceType<typeof StatisticComponent>;
