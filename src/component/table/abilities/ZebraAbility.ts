import type { AbilityDefinition } from '@/composable';
import { GROUP_SUMMARY_ROW_TYPE } from '../constants';
import type { TableAbilityHost } from './types';

/**
 * ZebraAbility — 斑马纹与行背景
 *
 * rowBg/stripe/stripeBg option → --q-table-odd-bg/--q-table-even-bg CSS 变量，
 * 虚拟滚动按 _virtualIndex、普通模式跳过分组汇总行与隐藏行交替着色。
 */
export const ZebraAbility = {
    _onStripeOptionChange(this: TableAbilityHost, _value: boolean): void {
        this._applyRowBgVars();
    },

    _onRowBgOptionChange(this: TableAbilityHost, _value: any): void {
        this._applyRowBgVars();
    },

    _onStripeBgOptionChange(this: TableAbilityHost, _value: any): void {
        this._applyRowBgVars();
    },

    _applyRowBgVars(this: TableAbilityHost): void {
        if (!this.el) return;
        const rowBg = this.getData('rowBg');
        const stripeBg = this.getData('stripeBg');
        const stripe = this.getData('stripe') ?? true;
        if (rowBg) {
            this.el.style.setProperty('--q-table-odd-bg', rowBg);
        } else {
            this.el.style.removeProperty('--q-table-odd-bg');
        }
        if (!stripe) {
            this.el.style.setProperty('--q-table-even-bg', rowBg || 'var(--q-color-bg, #fff)');
        } else if (stripeBg) {
            this.el.style.setProperty('--q-table-even-bg', stripeBg);
        } else {
            this.el.style.removeProperty('--q-table-even-bg');
        }
    },

    _applyZebraStripes(this: TableAbilityHost): void {
        if (this.getData('virtualScroll')) return;
        const items = this.items;
        if (!Array.isArray(items)) return;
        let stripeIndex = 0;
        for (const item of items) {
            const isGroupSummary = item?.type === GROUP_SUMMARY_ROW_TYPE;
            if (isGroupSummary) {
                stripeIndex = 0;
                continue;
            }
            if (item?.hidden) continue;
            item.removeCls?.('q-table-row--odd');
            item.removeCls?.('q-table-row--even');
            item.addCls?.(stripeIndex % 2 === 0 ? 'q-table-row--odd' : 'q-table-row--even');
            stripeIndex++;
        }
    },
} satisfies AbilityDefinition;
