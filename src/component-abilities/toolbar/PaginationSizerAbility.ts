/**
 * PaginationSizerAbility 分页每页条数选择器能力
 *
 * 渲染每页条数下拉选择器。
 * 新增能力，从 PaginationAbility 扩展而来。
 *
 * 功能：
 * - 选项从 pageSizes 属性读取
 * - 当前 pageSize 对应选项选中
 * - 选择变更调用 changeSize(size)
 * - 受 showSizer 配置控制，默认 false
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { PAGINATION_POSITIONS } from './pagination-positions';

export const PaginationSizerAbility: AbilityDefinition = {
    /**
     * 渲染每页条数选择器到 DocumentFragment
     */
    renderPaginationSizer(frag: DocumentFragment): void {
        if (!this.showSizer) return;

        const sizes = this.pageSizes;
        if (!sizes || sizes.length === 0) return;

        const container = document.createElement('span');
        container.className = 'q-pagination__sizer';
        container.setAttribute('data-pagination', 'sizer');
        container.setAttribute('data-position', String(PAGINATION_POSITIONS.SIZER));

        // 下拉选择框
        const select = document.createElement('select');
        select.className = 'q-pagination__sizer-select';

        for (const size of sizes) {
            const option = document.createElement('option');
            option.value = String(size);
            option.textContent = String(size);
            if (size === this.pageSize) option.selected = true;
            select.appendChild(option);
        }

        select.addEventListener('change', () => {
            const value = parseInt(select.value, 10);
            if (!isNaN(value)) {
                this.changeSize(value);
            }
        });

        container.appendChild(select);

        // "条/页" 文本
        const suffix = document.createElement('span');
        suffix.className = 'q-pagination__sizer-suffix';
        suffix.textContent = '条/页';
        container.appendChild(suffix);

        frag.appendChild(container);
    },
};
