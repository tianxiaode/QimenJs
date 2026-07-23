/**
 * VirtualListAbility 虚拟列表能力
 *
 * 提供虚拟滚动渲染，只渲染可视区域内的列表项
 * 适用于大数据量列表场景
 */

import type { AbilityDefinition } from '@qimenjs/composable';

export const VirtualListAbility= {
    /**
     * 容器高度
     */
    containerHeight: {
        get(): number {
            return this.abilityState('VirtualListAbility:containerHeight', 400);
        },
        set(value: number) {
            this.setAbilityState('VirtualListAbility:containerHeight', value);
            this.markDirty();
        },
    },

    /**
     * 行高
     */
    rowHeight: {
        get(): number {
            return this.abilityState('VirtualListAbility:rowHeight', 40);
        },
        set(value: number) {
            this.setAbilityState('VirtualListAbility:rowHeight', value);
            this.markDirty();
        },
    },

    /**
     * 缓冲行数
     */
    bufferCount: {
        get(): number {
            return this.abilityState('VirtualListAbility:bufferCount', 2);
        },
        set(value: number) {
            this.setAbilityState('VirtualListAbility:bufferCount', value);
        },
    },

    /**
     * 数据源
     */
    items: {
        get(): any[] {
            return this.abilityState('VirtualListAbility:items', () => []);
        },
        set(value: any[]) {
            this.setAbilityState('VirtualListAbility:items', value);
            this.markDirty();
        },
    },

    /**
     * 行渲染函数
     */
    rowRenderer: {
        get(): ((item: any, index: number) => HTMLElement) | null {
            return this.abilityState('VirtualListAbility:rowRenderer', null);
        },
        set(value: ((item: any, index: number) => HTMLElement) | null) {
            this.setAbilityState('VirtualListAbility:rowRenderer', value);
        },
    },

    /**
     * 滚动位置
     */
    scrollTop: {
        get(): number {
            return this.abilityState('VirtualListAbility:scrollTop', 0);
        },
        set(value: number) {
            this.setAbilityState('VirtualListAbility:scrollTop', value);
        },
    },

    /**
     * 可见行数
     */
    visibleCount: {
        get(): number {
            const rowHeight = this.rowHeight;
            if (rowHeight <= 0) return 0;
            return Math.ceil(this.containerHeight / rowHeight);
        },
    },

    /**
     * 起始索引
     */
    startIndex: {
        get(): number {
            const rowHeight = this.rowHeight;
            if (rowHeight <= 0) return 0;
            return Math.max(0, Math.floor(this.scrollTop / rowHeight) - this.bufferCount);
        },
    },

    /**
     * 结束索引
     */
    endIndex: {
        get(): number {
            const count = this.visibleCount + this.bufferCount * 2;
            return Math.min(this.startIndex + count, this.items.length);
        },
    },

    /**
     * 总高度
     */
    totalHeight: {
        get(): number {
            return this.items.length * this.rowHeight;
        },
    },

    /**
     * 渲染虚拟列表
     */
    renderVirtualList(): void {
        if (!this.el) return;

        const container = this.nodeMap?.['bodyScroll']?.el as HTMLElement;
        if (!container) return;

        container.style.height = `${this.containerHeight}px`;
        container.style.overflow = 'auto';
        container.style.position = 'relative';

        // 清空
        container.innerHTML = '';

        // 创建占位元素
        const spacer = document.createElement('div');
        spacer.style.height = `${this.totalHeight}px`;
        spacer.style.position = 'relative';
        container.appendChild(spacer);

        // 渲染可见行
        const start = this.startIndex;
        const end = this.endIndex;
        const renderer = this.rowRenderer;

        for (let i = start; i < end; i++) {
            const item = this.items[i];
            let rowEl: HTMLElement;

            if (renderer) {
                rowEl = renderer(item, i);
            } else {
                rowEl = document.createElement('div');
                rowEl.className = 'q-vlist__row';
                rowEl.textContent = typeof item === 'object' ? JSON.stringify(item) : String(item);
            }

            rowEl.style.position = 'absolute';
            rowEl.style.top = `${i * this.rowHeight}px`;
            rowEl.style.height = `${this.rowHeight}px`;
            rowEl.style.width = '100%';

            spacer.appendChild(rowEl);
        }
    },

    /**
     * 滚动到指定索引
     */
    scrollToIndex(index: number): void {
        const container = this.nodeMap?.['bodyScroll']?.el as HTMLElement;
        if (container) {
            container.scrollTop = index * this.rowHeight;
        }
        this.scrollTop = index * this.rowHeight;
    },

    /**
     * 初始化虚拟列表滚动监听
     */
    initVirtualScroll(): void {
        const container = this.nodeMap?.['bodyScroll']?.el as HTMLElement;
        if (!container) return;

        this.bind(container, 'scroll');
        this.on('scroll', () => {
            this.scrollTop = container.scrollTop;
            this.renderVirtualList();
        });
    },
} satisfies AbilityDefinition;
