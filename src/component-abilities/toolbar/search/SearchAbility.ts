/**
 * SearchAbility 搜索能力（兼容聚合层）
 *
 * 为工具栏注入搜索功能，支持简单搜索和复杂搜索两种模式。
 *
 * 简单搜索模式（searchMode='simple'）：
 * - 渲染关键词输入框 + 搜索按钮
 * - 输入框 input 事件防抖后发射 searchchange
 * - 搜索按钮点击发射 searchsubmit + searchchange
 *
 * 复杂搜索模式（searchMode='complex'）：
 * - 仅渲染搜索按钮
 * - 开发人员通过 searchParams 设置搜索参数
 * - 可通过 emitSearch(params) 手动触发搜索
 *
 * 本文件是兼容聚合层，通过 Object.assign 合并所有子能力的属性和方法，
 * 保持单个 AbilityDefinition 的形式。
 *
 * 子能力拆分：
 * - SearchInputAbility: 关键词输入框 + 防抖 change 触发
 * - SearchButtonAbility: 搜索按钮 + 点击事件
 * - SearchEventsAbility: 搜索事件发射
 *
 * @example
 * ```js
 * // 简单搜索
 * { type: ComponentTypes.TOOLBAR, searchMode: 'simple', searchDebounce: 300 }
 *
 * // 复杂搜索
 * { type: ComponentTypes.TOOLBAR, searchMode: 'complex', searchText: '筛选' }
 *
 * // 运行时
 * toolbar.keyword = 'test';
 * toolbar.emitSearch({ status: 'active', minPrice: 100 });
 * ```
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { SearchInputAbility } from './SearchInputAbility';
import { SearchButtonAbility } from './SearchButtonAbility';
import { SearchEventsAbility } from './SearchEventsAbility';
import { SEARCH_POSITIONS } from './search-positions';

// 重新导出位置常量
export { SEARCH_POSITIONS };

/**
 * SearchAbility 搜索能力
 *
 * 通过 Object.assign 合并所有子能力，保持单个 AbilityDefinition 的形式，
 * ToolbarComponent 的 static abilities 数组无需修改。
 */
export const SearchAbility: AbilityDefinition = Object.assign({},
    SearchInputAbility,
    SearchButtonAbility,
    SearchEventsAbility,
    {
        /**
         * 统一渲染协调
         *
         * 移除旧搜索元素，按位置顺序调用各子能力的渲染方法。
         */
        renderSearch(): void {
            if (!this.el) return;

            // 移除旧搜索元素
            const oldItems = this.el.querySelectorAll('[data-search]');
            oldItems.forEach((el: Element) => el.remove());

            const frag = document.createDocumentFragment();

            // 按位置顺序渲染各子能力
            this.renderSearchInput?.(frag);
            this.renderSearchButton?.(frag);

            this.el.appendChild(frag);
        },

        /**
         * 搜索回调（兼容旧版 interaction/SearchAbility）
         *
         * 当 onSearch 被设置时，自动监听 searchchange 事件并调用回调。
         * 这确保了 SelectComponent 等现有使用方的兼容性。
         */
        onSearch: {
            get(this: any): ((keyword: string) => void) | undefined {
                return this.abilityState('SearchAbility:onSearch', () => undefined);
            },
            set(this: any, handler: (keyword: string) => void): void {
                this.setAbilityState('SearchAbility:onSearch', handler);
            },
        },

        /**
         * 从 props 初始化（委托各子能力）
         */
        __initProps(props: Record<string, any>): void {
            // 搜索相关 props
            if (props.keyword !== undefined) this.keyword = props.keyword;
            if (props.searchMode) this.searchMode = props.searchMode;
            if (props.searchDebounce !== undefined) this.searchDebounce = props.searchDebounce;
            if (props.searchPlaceholder) this.searchPlaceholder = props.searchPlaceholder;
            if (props.showSearchButton !== undefined) this.showSearchButton = props.showSearchButton;
            if (props.searchText) this.searchText = props.searchText;
            if (props.searchParams) this.searchParams = props.searchParams;

            // 兼容旧 onSearch 回调
            if (props.onSearch) this.onSearch = props.onSearch;
        },
    },
);
