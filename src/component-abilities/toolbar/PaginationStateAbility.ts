/**
 * PaginationStateAbility 分页状态管理能力
 *
 * 管理分页核心状态属性，提供 totalPages 自动计算。
 * 从 PaginationAbility 拆分而来，职责单一：只管状态，不管事件和渲染。
 *
 * 状态属性：
 * - currentPage: 当前页码
 * - totalPages: 总页数（totalRecords/pageSize 变更时自动重算）
 * - totalRecords: 总记录数
 * - pageSize: 每页条数
 * - pageSizes: 每页条数选项列表
 *
 * 配置属性：
 * - showFirstLast: 是否显示首页/末页按钮
 * - showPageInfo: 是否显示分页信息
 * - showJumper: 是否显示页码输入框
 * - showSizer: 是否显示每页条数选择器
 * - pageRange: 页码按钮显示范围
 */

import type { AbilityDefinition } from '@qimenjs/composable';

export const PaginationStateAbility: AbilityDefinition = {
    /**
     * currentPage getter/setter
     */
    currentPage: {
        get(): number {
            return this.abilityState('PaginationAbility:currentPage', () => 1);
        },
        set(value: number): void {
            this.setAbilityState('PaginationAbility:currentPage', value);
            this.renderPagination?.();
        },
    },

    /**
     * totalPages getter/setter
     */
    totalPages: {
        get(): number {
            return this.abilityState('PaginationAbility:totalPages', () => 1);
        },
        set(value: number): void {
            this.setAbilityState('PaginationAbility:totalPages', value);
            this.renderPagination?.();
        },
    },

    /**
     * totalRecords getter/setter
     * 变更时自动重算 totalPages
     */
    totalRecords: {
        get(): number {
            return this.abilityState('PaginationAbility:totalRecords', () => 0);
        },
        set(value: number): void {
            this.setAbilityState('PaginationAbility:totalRecords', value);
            // 自动重算 totalPages
            const ps = this.pageSize || 10;
            const tp = Math.ceil(value / ps) || 1;
            this.setAbilityState('PaginationAbility:totalPages', tp);
            // 修正 currentPage 不超过 totalPages
            const cp = this.abilityState('PaginationAbility:currentPage', () => 1);
            if (cp > tp) {
                this.setAbilityState('PaginationAbility:currentPage', tp);
            }
            this.renderPagination?.();
        },
    },

    /**
     * pageSize getter/setter
     * 变更时自动重算 totalPages
     */
    pageSize: {
        get(): number {
            return this.abilityState('PaginationAbility:pageSize', () => 10);
        },
        set(value: number): void {
            this.setAbilityState('PaginationAbility:pageSize', value);
            // 自动重算 totalPages
            const tr = this.abilityState('PaginationAbility:totalRecords', () => 0);
            const tp = Math.ceil(tr / value) || 1;
            this.setAbilityState('PaginationAbility:totalPages', tp);
            // 修正 currentPage 不超过 totalPages
            const cp = this.abilityState('PaginationAbility:currentPage', () => 1);
            if (cp > tp) {
                this.setAbilityState('PaginationAbility:currentPage', tp);
            }
            this.renderPagination?.();
        },
    },

    /**
     * pageSizes getter/setter
     * 每页条数选项列表
     */
    pageSizes: {
        get(): number[] {
            return this.abilityState('PaginationAbility:pageSizes', () => [10, 20, 50]);
        },
        set(value: number[]): void {
            this.setAbilityState('PaginationAbility:pageSizes', value);
            this.renderPagination?.();
        },
    },

    /**
     * showFirstLast getter/setter
     */
    showFirstLast: {
        get(): boolean {
            return this.abilityState('PaginationAbility:showFirstLast', () => true);
        },
        set(value: boolean): void {
            this.setAbilityState('PaginationAbility:showFirstLast', value);
            this.renderPagination?.();
        },
    },

    /**
     * showPageInfo getter/setter
     */
    showPageInfo: {
        get(): boolean {
            return this.abilityState('PaginationAbility:showPageInfo', () => true);
        },
        set(value: boolean): void {
            this.setAbilityState('PaginationAbility:showPageInfo', value);
            this.renderPagination?.();
        },
    },

    /**
     * showJumper getter/setter
     * 是否显示页码输入框
     */
    showJumper: {
        get(): boolean {
            return this.abilityState('PaginationAbility:showJumper', () => false);
        },
        set(value: boolean): void {
            this.setAbilityState('PaginationAbility:showJumper', value);
            this.renderPagination?.();
        },
    },

    /**
     * showSizer getter/setter
     * 是否显示每页条数选择器
     */
    showSizer: {
        get(): boolean {
            return this.abilityState('PaginationAbility:showSizer', () => false);
        },
        set(value: boolean): void {
            this.setAbilityState('PaginationAbility:showSizer', value);
            this.renderPagination?.();
        },
    },

    /**
     * pageRange getter/setter
     * 页码按钮显示范围（当前页前后各显示多少个页码）
     */
    pageRange: {
        get(): number {
            return this.abilityState('PaginationAbility:pageRange', () => 2);
        },
        set(value: number): void {
            this.setAbilityState('PaginationAbility:pageRange', value);
            this.renderPagination?.();
        },
    },

    /**
     * 从 props 初始化
     */
    __initProps(props: Record<string, any>): void {
        if (props.currentPage) this.currentPage = props.currentPage;
        if (props.totalPages) this.totalPages = props.totalPages;
        if (props.totalRecords) this.totalRecords = props.totalRecords;
        if (props.pageSize) this.pageSize = props.pageSize;
        if (props.pageSizes) this.pageSizes = props.pageSizes;
        if (props.showFirstLast !== undefined) this.showFirstLast = props.showFirstLast;
        if (props.showPageInfo !== undefined) this.showPageInfo = props.showPageInfo;
        if (props.showJumper !== undefined) this.showJumper = props.showJumper;
        if (props.showSizer !== undefined) this.showSizer = props.showSizer;
        if (props.pageRange !== undefined) this.pageRange = props.pageRange;
    },
};
