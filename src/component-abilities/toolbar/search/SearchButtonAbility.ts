/**
 * SearchButtonAbility 搜索按钮能力
 *
 * 管理搜索按钮 UI 和点击事件。
 * 点击时始终组装完整数据（keyword + search），实现组合查询。
 *
 * 属性：
 * - showSearchButton: 搜索按钮显隐，默认 true
 * - searchText: 搜索按钮文本
 * - searchParams: 搜索参数，与 keyword 可同时使用
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { SEARCH_POSITIONS } from './search-positions';

export const SearchButtonAbility: AbilityDefinition = {
    /**
     * 搜索按钮显隐
     */
    showSearchButton: {
        get(): boolean {
            return this.abilityState('SearchAbility:showSearchButton', () => true);
        },
        set(value: boolean): void {
            this.setAbilityState('SearchAbility:showSearchButton', value);
        },
    },

    /**
     * 搜索按钮文本
     */
    searchText: {
        get(): string {
            return this.abilityState('SearchAbility:searchText', () => '搜索');
        },
        set(value: string): void {
            this.setAbilityState('SearchAbility:searchText', value);
        },
    },

    /**
     * 搜索参数
     *
     * 与 keyword 可同时使用，实现组合查询。
     */
    searchParams: {
        get(): Record<string, any> {
            return this.abilityState('SearchAbility:searchParams', () => ({}));
        },
        set(value: Record<string, any>): void {
            this.setAbilityState('SearchAbility:searchParams', value);
        },
    },

    /**
     * 渲染搜索按钮到 DocumentFragment
     *
     * 仅在 showSearchButton === true 时渲染。
     * 点击时始终组装完整数据（keyword + search）。
     */
    renderSearchButton(frag: DocumentFragment): void {
        if (!this.showSearchButton) return;

        const btn = document.createElement('button');
        btn.className = 'q-search__btn q-button';
        btn.setAttribute('data-search', 'button');
        btn.setAttribute('data-position', String(SEARCH_POSITIONS.BUTTON));
        btn.textContent = this.searchText;

        btn.addEventListener('click', () => {
            const data: { keyword?: string; search?: Record<string, any> } = {};
            if (this.keyword) {
                data.keyword = this.keyword;
            }
            if (this.searchParams && Object.keys(this.searchParams).length > 0) {
                data.search = this.searchParams;
            }
            this.emitSearchSubmit?.(data);
            this.emitSearchChange?.(data);
        });

        frag.appendChild(btn);
    },

    /**
     * 从 props 初始化
     */
    __initProps(props: Record<string, any>): void {
        if (props.showSearchButton !== undefined) this.showSearchButton = props.showSearchButton;
        if (props.searchText) this.searchText = props.searchText;
        if (props.searchParams) this.searchParams = props.searchParams;
    },
};
