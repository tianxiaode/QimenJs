/**
 * SearchInputAbility 搜索输入框能力
 *
 * 管理关键词输入框 UI 和防抖 change 触发。
 * 仅在 searchMode === 'simple' 时渲染输入框。
 *
 * 属性：
 * - keyword: 搜索关键词（兼容旧版 interaction/SearchAbility）
 * - searchMode: UI 渲染模式 'simple' | 'complex'
 * - searchDebounce: 防抖等待时间（ms），默认 300，0 禁用
 * - searchPlaceholder: 输入框占位文本
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { SEARCH_POSITIONS } from './search-positions';

export const SearchInputAbility: AbilityDefinition = {
    /**
     * 搜索关键词
     *
     * 兼容旧版 interaction/SearchAbility 的 keyword 属性，
     * abilityState 键名保持一致。
     */
    keyword: {
        get(): string {
            return this.abilityState('SearchAbility:keyword', () => '');
        },
        set(value: string): void {
            this.setAbilityState('SearchAbility:keyword', value);
        },
    },

    /**
     * UI 渲染模式
     *
     * 'simple' - 显示输入框+搜索按钮
     * 'complex' - 仅显示搜索按钮
     */
    searchMode: {
        get(): 'simple' | 'complex' {
            return this.abilityState('SearchAbility:searchMode', () => 'simple' as const);
        },
        set(value: 'simple' | 'complex'): void {
            this.setAbilityState('SearchAbility:searchMode', value);
        },
    },

    /**
     * 防抖等待时间（毫秒）
     *
     * 默认 300ms，设为 0 禁用防抖。
     */
    searchDebounce: {
        get(): number {
            return this.abilityState('SearchAbility:searchDebounce', () => 300);
        },
        set(value: number): void {
            this.setAbilityState('SearchAbility:searchDebounce', value);
        },
    },

    /**
     * 搜索输入框占位文本
     */
    searchPlaceholder: {
        get(): string {
            return this.abilityState('SearchAbility:searchPlaceholder', () => '请输入关键词');
        },
        set(value: string): void {
            this.setAbilityState('SearchAbility:searchPlaceholder', value);
        },
    },

    /**
     * 渲染搜索输入框到 DocumentFragment
     *
     * 仅在 searchMode === 'simple' 时渲染。
     * input 事件通过 debounce 防抖后发射 searchchange 事件。
     */
    renderSearchInput(frag: DocumentFragment): void {
        if (this.searchMode !== 'simple') return;

        const input = document.createElement('input');
        input.className = 'q-search__input';
        input.setAttribute('data-search', 'input');
        input.setAttribute('data-position', String(SEARCH_POSITIONS.INPUT));
        input.placeholder = this.searchPlaceholder;
        input.value = this.keyword;

        input.addEventListener('input', () => {
            this.keyword = input.value;
            const debouncedEmit = this.debounce(
                'SearchAbility:input',
                () => {
                    const data: { keyword: string; search?: Record<string, any> } = { keyword: this.keyword };
                    if (this.searchParams && Object.keys(this.searchParams).length > 0) {
                        data.search = this.searchParams;
                    }
                    this.emitSearchChange?.(data);
                },
                this.searchDebounce,
            );
            debouncedEmit();
        });

        frag.appendChild(input);
    },

    /**
     * 从 props 初始化
     */
    __initProps(props: Record<string, any>): void {
        if (props.keyword !== undefined) this.keyword = props.keyword;
        if (props.searchMode) this.searchMode = props.searchMode;
        if (props.searchDebounce !== undefined) this.searchDebounce = props.searchDebounce;
        if (props.searchPlaceholder) this.searchPlaceholder = props.searchPlaceholder;
    },
};
