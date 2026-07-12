/**
 * OverflowMenuAbility — 溢出菜单能力
 *
 * 当子组件超出容器可视范围时：
 * - 横向：在最右边显示下拉箭头，点击弹出菜单显示溢出的子项
 * - 纵向：在最下边显示下拉箭头，点击弹出菜单显示溢出的子项
 *
 * 适用于工具栏、标签栏等横向/纵向溢出容器。
 *
 * 互斥说明：与 OverflowScrollAbility 互斥，
 * 同一容器不应同时使用两种溢出策略。
 *
 * 模板约定：
 * - 需要模板预定义以下节点（通过 nodeMap 引用）：
 *   - toolbar:contentArea — 子项容器（兼做可见区域）
 *   - toolbar:triggerBtn — 下拉触发按钮
 *   - toolbar:menuPanel — 下拉菜单面板
 * - 能力初始化时只做样式/事件绑定，不创建/移动 DOM
 *
 * 事件模式：
 * - 使用 this.emit 发布 overflowmenu/overflowchange 事件
 * - 使用 abilityState / setAbilityState 做数据隔离
 * - 使用 this.onCleanup 注册清理回调
 */

import type { AbilityDefinition } from '@/composable';
import type { OverflowDirection } from './OverflowScrollAbility';

// ─── 溢出菜单项 ────────────────────────────────────────

export interface OverflowMenuItem {
    /** 菜单项标识 */
    key: string;
    /** 菜单项文本 */
    label: string;
    /** 原始子元素引用 */
    element?: HTMLElement;
    /** 附加数据 */
    data?: any;
}

// ─── 配置 ──────────────────────────────────────────────

export interface OverflowMenuConfig {
    /** 溢出方向，默认 'horizontal' */
    direction?: OverflowDirection;
    /** 可见区域最多显示的子项数量，0 表示自动检测，默认 0 */
    maxVisibleItems?: number;
    /** 菜单弹出位置偏移，默认 0 */
    menuOffset?: number;
}

// ─── 能力定义 ──────────────────────────────────────────

export const OverflowMenuAbility: AbilityDefinition = {
    // ─── 属性访问方法 ───

    /**
     * 获取溢出菜单属性
     */
    getOverflowMenu(key: string): any {
        return this.abilityState(`OverflowMenuAbility:prop:${key}`);
    },

    /**
     * 设置溢出菜单属性
     */
    setOverflowMenu(key: string, value: any): void {
        this.setAbilityState(`OverflowMenuAbility:prop:${key}`, value);
    },

    // ─── 初始化 ───

    /**
     * 初始化溢出菜单能力
     *
     * 从 nodeMap 获取模板预定义的节点，绑定事件和 Observer。
     * 不创建/移动 DOM，所有节点由模板预定义。
     *
     * @param config - 配置项
     */
    initOverflowMenu(config: OverflowMenuConfig = {}): void {
        const direction: OverflowDirection = config.direction ?? 'horizontal';
        const maxVisibleItems: number = config.maxVisibleItems ?? 0;
        const menuOffset: number = config.menuOffset ?? 0;

        this.setOverflowMenu('direction', direction);
        this.setOverflowMenu('maxVisibleItems', maxVisibleItems);
        this.setOverflowMenu('menuOffset', menuOffset);
        this.setOverflowMenu('isMenuOpen', false);

        // 从 nodeMap 获取模板预定义的节点
        const contentArea = this.nodeMap?.['toolbar']?.['contentArea']?.el as HTMLElement | undefined;
        const triggerBtn = this.nodeMap?.['toolbar']?.['triggerBtn']?.el as HTMLElement | undefined;
        const menuPanel = this.nodeMap?.['toolbar']?.['menuPanel']?.el as HTMLElement | undefined;

        if (!contentArea || !triggerBtn || !menuPanel) return;

        const container = this.el;

        // ── 1. 设置容器样式 ──

        container.classList.add('q-overflow-menu-container');
        container.classList.add(`q-overflow-menu-container--${direction}`);

        // contentArea 作为可见区域
        contentArea.classList.add('q-overflow-menu__visible');

        // 触发按钮方向样式
        triggerBtn.classList.add(`q-overflow-menu__trigger--${direction}`);

        // 菜单面板方向样式
        menuPanel.classList.add(`q-overflow-menu__panel--${direction}`);

        // ── 2. 点击触发按钮切换菜单 ──

        triggerBtn.addEventListener('click', (e: Event) => {
            e.stopPropagation();
            this.toggleOverflowMenu();
        });

        // ── 3. 点击外部关闭菜单 ──

        const onDocumentClick = (e: MouseEvent) => {
            if (!container.contains(e.target as Node)) {
                this.closeOverflowMenu();
            }
        };
        document.addEventListener('click', onDocumentClick);

        // ── 4. ResizeObserver 监听容器尺寸变化 ──

        const resizeObserver = new ResizeObserver(() => {
            this.recalcOverflowItems();
        });
        resizeObserver.observe(container);
        this.setOverflowMenu('resizeObserver', resizeObserver);

        // ── 5. MutationObserver 监听子元素变化 ──

        const mutationObserver = new MutationObserver(() => {
            this.recalcOverflowItems();
        });
        mutationObserver.observe(contentArea, { childList: true });
        this.setOverflowMenu('mutationObserver', mutationObserver);

        // ── 6. 初始计算 ──

        requestAnimationFrame(() => {
            this.recalcOverflowItems();
        });

        // ── 7. 清理 ──

        this.onCleanup(() => {
            document.removeEventListener('click', onDocumentClick);
            resizeObserver.disconnect();
            mutationObserver.disconnect();

            container.classList.remove('q-overflow-menu-container', `q-overflow-menu-container--${direction}`);
            container.classList.remove('q-overflow-menu-container--overflowing');

            contentArea.classList.remove('q-overflow-menu__visible');

            // 隐藏触发按钮和菜单面板（不移除，模板节点由 withTemplate 管理）
            triggerBtn.hidden = true;
            menuPanel.hidden = true;
            triggerBtn.classList.remove('q-overflow-menu__trigger--active');

            // 还原被隐藏的子项
            const children = Array.from(contentArea.children) as HTMLElement[];
            for (const child of children) {
                child.hidden = false;
            }
        });
    },

    // ─── 重新计算溢出项 ───

    /**
     * 重新计算哪些子项溢出，更新菜单内容
     */
    recalcOverflowItems(): void {
        const contentArea = this.nodeMap?.['toolbar']?.['contentArea']?.el as HTMLElement | null;
        const triggerBtn = this.nodeMap?.['toolbar']?.['triggerBtn']?.el as HTMLElement | null;
        const menuPanel = this.nodeMap?.['toolbar']?.['menuPanel']?.el as HTMLElement | null;
        const direction = this.getOverflowMenu('direction') as OverflowDirection;
        const maxVisibleItems = this.getOverflowMenu('maxVisibleItems') as number;

        if (!contentArea || !triggerBtn || !menuPanel) return;

        const containerRect = this.el.getBoundingClientRect();
        const children = Array.from(contentArea.children) as HTMLElement[];

        const overflowItems: OverflowMenuItem[] = [];
        let firstOverflowIndex = children.length; // 默认全部可见

        if (maxVisibleItems > 0) {
            // 按数量限制
            firstOverflowIndex = maxVisibleItems;
        } else {
            // 自动检测：找到第一个超出容器边界的子元素
            for (let i = 0; i < children.length; i++) {
                const childRect = children[i].getBoundingClientRect();
                const isOverflowing = direction === 'horizontal'
                    ? childRect.right > containerRect.right
                    : childRect.bottom > containerRect.bottom;

                if (isOverflowing) {
                    firstOverflowIndex = i;
                    break;
                }
            }
        }

        // 标记可见/隐藏
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (i >= firstOverflowIndex) {
                child.hidden = true;
                overflowItems.push({
                    key: child.getAttribute('data-key') ?? `item-${i}`,
                    label: child.getAttribute('data-label') ?? child.textContent ?? `项 ${i + 1}`,
                    element: child,
                });
            } else {
                child.hidden = false;
            }
        }

        // 更新触发按钮显隐
        triggerBtn.hidden = overflowItems.length === 0;

        // 更新容器 CSS 状态类
        this.el.classList.toggle('q-overflow-menu-container--overflowing', overflowItems.length > 0);

        // 重建菜单面板内容
        menuPanel.innerHTML = '';
        for (const item of overflowItems) {
            const menuItem = document.createElement('div');
            menuItem.className = 'q-overflow-menu__item';
            menuItem.textContent = item.label;
            menuItem.setAttribute('data-key', item.key);

            menuItem.addEventListener('click', () => {
                this.emit('overflowmenu', {
                    key: item.key,
                    label: item.label,
                    element: item.element,
                    data: item.data,
                }, { source: this.eventKey });

                this.closeOverflowMenu();
            });

            menuPanel.appendChild(menuItem);
        }

        this.setOverflowMenu('overflowItems', overflowItems);

        // 发布溢出变化事件
        this.emit('overflowchange', {
            overflowCount: overflowItems.length,
            overflowItems,
        }, { source: this.eventKey });

        // 如果菜单已打开，关闭它（因为项已变化）
        if (this.getOverflowMenu('isMenuOpen')) {
            this.closeOverflowMenu();
        }
    },

    // ─── 切换菜单 ───

    /**
     * 切换下拉菜单显隐
     */
    toggleOverflowMenu(): void {
        const isOpen = this.getOverflowMenu('isMenuOpen') as boolean;
        if (isOpen) {
            this.closeOverflowMenu();
        } else {
            this.openOverflowMenu();
        }
    },

    // ─── 打开菜单 ───

    /**
     * 打开下拉菜单
     */
    openOverflowMenu(): void {
        const menuPanel = this.nodeMap?.['toolbar']?.['menuPanel']?.el as HTMLElement | null;
        const triggerBtn = this.nodeMap?.['toolbar']?.['triggerBtn']?.el as HTMLElement | null;
        const direction = this.getOverflowMenu('direction') as OverflowDirection;
        const menuOffset = this.getOverflowMenu('menuOffset') as number;

        if (!menuPanel || !triggerBtn) return;

        // 定位菜单面板
        const triggerRect = triggerBtn.getBoundingClientRect();
        const containerRect = this.el.getBoundingClientRect();

        if (direction === 'horizontal') {
            // 横向：菜单在触发按钮下方，右对齐
            menuPanel.style.top = `${triggerRect.bottom - containerRect.top + menuOffset}px`;
            menuPanel.style.right = `${containerRect.right - triggerRect.right}px`;
            menuPanel.style.left = '';
        } else {
            // 纵向：菜单在触发按钮左侧，下对齐
            menuPanel.style.left = `${triggerRect.left - containerRect.left + menuOffset}px`;
            menuPanel.style.top = `${triggerRect.bottom - containerRect.top}px`;
            menuPanel.style.right = '';
        }

        menuPanel.hidden = false;
        triggerBtn.classList.add('q-overflow-menu__trigger--active');

        this.setOverflowMenu('isMenuOpen', true);
    },

    // ─── 关闭菜单 ───

    /**
     * 关闭下拉菜单
     */
    closeOverflowMenu(): void {
        const menuPanel = this.nodeMap?.['toolbar']?.['menuPanel']?.el as HTMLElement | null;
        const triggerBtn = this.nodeMap?.['toolbar']?.['triggerBtn']?.el as HTMLElement | null;

        if (!menuPanel || !triggerBtn) return;

        menuPanel.hidden = true;
        triggerBtn.classList.remove('q-overflow-menu__trigger--active');

        this.setOverflowMenu('isMenuOpen', false);
    },

    // ─── 获取溢出项列表 ───

    /**
     * 获取当前溢出的菜单项
     */
    getOverflowItems(): OverflowMenuItem[] {
        return this.getOverflowMenu('overflowItems') ?? [];
    },
};
