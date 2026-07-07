/**
 * PaginationAbility 分页能力（兼容聚合层）
 *
 * 为工具栏注入分页按钮组：首页/上一页/页码/下一页/末页 + 页码输入框 + 每页条数选择器 + 页码信息。
 * 所有按钮通过 position 排序，可通过配置显隐。
 *
 * 本文件是兼容聚合层，通过 Object.assign 合并所有子能力的属性和方法，
 * 保持与原有 PaginationAbility 完全兼容的对外接口。
 *
 * 子能力拆分：
 * - PaginationStateAbility: 分页状态管理
 * - PaginationEventsAbility: 分页事件分发
 * - PaginationNavAbility: 导航按钮渲染
 * - PaginationPagesAbility: 页码按钮渲染
 * - PaginationJumperAbility: 页码输入框渲染（新增）
 * - PaginationSizerAbility: 每页条数选择器渲染（新增）
 * - PaginationInfoAbility: 分页信息渲染
 *
 * @example
 * ```js
 * // 给任意 Toolbar 加分页（完整功能）
 * class MyToolbar extends ComponentBase {
 *     static abilities = [LayoutAbility, ChildrenAbility, ToolbarAbility, PaginationAbility];
 * }
 *
 * // 布局定义
 * { type: ComponentTypes.TOOLBAR, currentPage: 1, totalPages: 10, totalRecords: 95 }
 *
 * // 带页码输入框和每页条数选择器
 * { type: ComponentTypes.TOOLBAR, currentPage: 1, totalPages: 10, totalRecords: 95,
 *   showJumper: true, showSizer: true, pageSizes: [10, 20, 50, 100] }
 *
 * // 运行时
 * toolbar.gotoPage(3);
 * toolbar.nextPage();
 * toolbar.changeSize(50);
 * ```
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { PaginationStateAbility } from './PaginationStateAbility';
import { PaginationEventsAbility } from './PaginationEventsAbility';
import { PaginationNavAbility } from './PaginationNavAbility';
import { PaginationPagesAbility } from './PaginationPagesAbility';
import { PaginationJumperAbility } from './PaginationJumperAbility';
import { PaginationSizerAbility } from './PaginationSizerAbility';
import { PaginationInfoAbility } from './PaginationInfoAbility';
import { PAGINATION_POSITIONS } from './pagination-positions';

// 重新导出位置常量，保持向后兼容
export { PAGINATION_POSITIONS };

/**
 * PaginationAbility 分页能力
 *
 * 通过 Object.assign 合并所有子能力，保持单个 AbilityDefinition 的形式，
 * ToolbarComponent 的 static abilities 数组无需修改。
 */
export const PaginationAbility: AbilityDefinition = Object.assign({},
    PaginationStateAbility,
    PaginationEventsAbility,
    PaginationNavAbility,
    PaginationPagesAbility,
    PaginationJumperAbility,
    PaginationSizerAbility,
    PaginationInfoAbility,
    {
        /**
         * 统一渲染协调
         *
         * 移除旧分页元素，按位置顺序调用各子能力的渲染方法。
         */
        renderPagination(): void {
            if (!this.el) return;

            // 移除旧分页元素
            const oldItems = this.el.querySelectorAll('[data-pagination]');
            oldItems.forEach((el: Element) => el.remove());

            const frag = document.createDocumentFragment();

            // 按位置顺序渲染各子能力
            this.renderPaginationNav?.(frag);
            this.renderPaginationPages?.(frag);
            this.renderPaginationJumper?.(frag);
            this.renderPaginationSizer?.(frag);
            this.renderPaginationInfo?.(frag);

            this.el.appendChild(frag);
        },
    },
);
