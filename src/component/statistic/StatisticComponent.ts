import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@/component-core';
import { STATISTIC_TPL } from './statistic-tpl';
import { Definitions } from '@/composable';
import { formatNumber } from '@/utils/number';
import './statistic.css';

export type StatisticTrend = 'up' | 'down' | 'flat';

const StatisticComponentDefs: Definitions = {
    targetToOptions: {
        title: { target: 'title', to: 'text' },
    },
    options: {
        value: null,
        prefix: null,
        suffix: null,
        format: null,
        precision: null,
        trend: 'flat',
        trendText: null,
        icon: null,
    },
} as const;

class StatisticComponent extends Component {
    static type = 'statistic';
    get tpl(): TemplateDecl {
        return STATISTIC_TPL;
    }

    _onValueOptionChange(_value: any): void {
        this._applyValue();
    }

    _onFormatOptionChange(_value: string): void {
        this._applyValue();
    }

    _onPrecisionOptionChange(_value: number): void {
        this._applyValue();
    }

    _onPrefixOptionChange(value: string): void {
        const el = this.getNodeEl('prefix');
        if (el) el.textContent = value ?? '';
        value ? this.removeCls('hidden', 'prefix') : this.addCls('hidden', 'prefix');
    }

    _onSuffixOptionChange(value: string): void {
        const el = this.getNodeEl('suffix');
        if (el) el.textContent = value ?? '';
        value ? this.removeCls('hidden', 'suffix') : this.addCls('hidden', 'suffix');
    }

    _onTrendOptionChange(_value: string): void {
        this._applyTrend();
    }

    _onTrendTextOptionChange(_value: string): void {
        this._applyTrend();
    }

    _onIconOptionChange(value: string): void {
        const el = this.getNodeEl('icon');
        if (el) el.textContent = value ?? '';
        value ? this.removeCls('hidden', 'icon') : this.addCls('hidden', 'icon');
    }

    private _applyValue(): void {
        const value = this.getData('value');
        const format = this.getData('format');
        const precision = this.getData('precision');

        let display: string;
        if (typeof value === 'number') {
            if (format) {
                display = formatNumber(value, format);
            } else if (precision !== null && precision !== undefined) {
                const fmt = `#,##0.${'0'.repeat(precision)}`;
                display = formatNumber(value, fmt);
            } else {
                display = String(value);
            }
        } else {
            display = value ?? '';
        }

        const el = this.getNodeEl('value');
        if (el) el.textContent = display;
    }

    private _applyTrend(): void {
        const trend = this.getData('trend');
        const trendText = this.getData('trendText');
        const el = this.getNodeEl('trend');
        if (!el) return;

        if (trend === 'flat' && !trendText) {
            this.addCls('hidden', 'trend');
            return;
        }

        this.removeCls('hidden', 'trend');
        this.removeCls('q-statistic__trend--up', 'trend');
        this.removeCls('q-statistic__trend--down', 'trend');
        if (trend !== 'flat') {
            this.addCls(`q-statistic__trend--${trend}`, 'trend');
        }
        const arrow = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '';
        el.textContent = trendText ? `${arrow} ${trendText}` : arrow;
    }
}

StatisticComponent.define(StatisticComponentDefs);

export { StatisticComponent };
export type StatisticComponentInstance = InstanceType<typeof StatisticComponent>;
