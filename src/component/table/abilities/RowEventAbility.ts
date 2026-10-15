import type { AbilityDefinition } from '@/composable';
import type { TableAbilityHost } from './types';
import { GROUP_SUMMARY_ROW_TYPE } from '../constants';

/**
 * RowEventAbility — 行区域点击分发中心
 *
 * dom 事件收拢：Table 的 [items] click 委托统一入口，按点击目标分发：
 * - 分组汇总行 → 直接调用 item.toggle()
 * - expand cell → 直接调用 row.expand()/collapse()
 * - 其余 → 委托行选择（RowSelectAbility._onRowSelectClick）
 *
 * 新增行区域交互（如 row body）只需在此加分发分支。
 */
export const RowEventAbility = {
    _onRowAreaClick(this: TableAbilityHost, domEvt: any): void {
        const item = domEvt?.targetComponent;
        if (!item) return;
        const clickTarget = domEvt?.data?.originalEvent?.target as HTMLElement | undefined;
        if (!clickTarget) return;

        if (item.type === GROUP_SUMMARY_ROW_TYPE) {
            item.toggle();
            return;
        }

        if (this._isExpandCellClick(item, clickTarget)) {
            if (item.isExpanded) {
                item.collapse();
            } else {
                item.expand();
            }
            return;
        }

        this._onRowSelectClick(domEvt);
    },

    _isExpandCellClick(this: TableAbilityHost, row: any, clickTarget: HTMLElement): boolean {
        if (!this.getData('rowBody')) return false;
        const expandCell = row?._cells?.get('_expand');
        return !!expandCell?.el?.contains(clickTarget);
    },
} satisfies AbilityDefinition;
