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
    /** 下拉按钮的 CSS 类名前缀，默认 'q-overflow-menu' */
    menuClassPrefix?: string;
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
     * @param config - 配置项
     */
    initOverflowMenu(config: OverflowMenuConfig = {}): void {
        const direction: OverflowDirection = config.direction ?? 'horizontal';
        const menuClassPrefix: string = config.menuClassPrefix ?? 'q-overflow-menu';
        const maxVisibleItems: number = config.maxVisibleItems ?? 0;
        const menuOffset: number = config.menuOffset ?? 0;

        this.setOverflowMenu('direction', direction);
        this.setOverflowMenu('menuClassPrefix', menuClassPrefix);
        this.setOverflowMenu('maxVisibleItems', maxVisibleItems);
        this.setOverflowMenu('menuOffset', menuOffset);
        this.setOverflowMenu('isMenuOpen', false);

        const container = this.el;

        // ── 1. 设置容器样式 ──

        container.classList.add('q-overflow-menu-container');
        container.classList.add(`q-overflow-menu-container--${direction}`);

        // ── 2. 创建可见区域 ──

        const visibleArea = document.createElement('div');
        visibleArea.className = 'q-overflow-menu__visible';

        // 移动所有子节点到可见区域
        while (container.firstChild) {
            visibleArea.appendChild(container.firstChild);
        }
        container.appendChild(visibleArea);

        this.setOverflowMenu('visibleArea', visibleArea);

        // ── 3. 创建下拉触发按钮 ──

        const triggerBtn = document.createElement('button');
        triggerBtn.type = 'button';
        triggerBtn.className = `${menuClassPrefix}__trigger ${menuClassPrefix}__trigger--${direction}`;
        triggerBtn.setAttribute('aria-label', direction === 'horizontal' ? '更多操作' : '更多操作');
        triggerBtn.style.display = 'none';

        const triggerIcon = document.createElement('span');
        triggerIcon.className = `${menuClassPrefix}__trigger-icon ${menuClassPrefix}__trigger-icon--${direction}`;
        triggerBtn.appendChild(triggerIcon);

        container.appendChild(triggerBtn);

        this.setOverflowMenu('triggerBtn', triggerBtn);

        // ── 4. 创建下拉菜单面板 ──

        const menuPanel = document.createElement('div');
        menuPanel.className = `${menuClassPrefix}__panel ${menuClassPrefix}__panel--${direction}`;
        menuPanel.style.display = 'none';
        menuPanel.style.position = 'absolute';

        // 挂载到容器（相对定位的父级）
        container.appendChild(menuPanel);

        this.setOverflowMenu('menuPanel', menuPanel);

        // ── 5. 点击触发按钮切换菜单 ──

        triggerBtn.addEventListener('click', (e: Event) => {
            e.stopPropagation();
            this.toggleOverflowMenu();
        });

        // ── 6. 点击外部关闭菜单 ──

        const onDocumentClick = (e: MouseEvent) => {
            if (!container.contains(e.target as Node)) {
                this.closeOverflowMenu();
            }
        };
        document.addEventListener('click', onDocumentClick);

        // ── 7. ResizeObserver 监听容器尺寸变化 ──

        const resizeObserver = new ResizeObserver(() => {
            this.recalcOverflowItems();
        });
        resizeObserver.observe(container);
        this.setOverflowMenu('resizeObserver', resizeObserver);

        // ── 8. MutationObserver 监听子元素变化 ──

        const mutationObserver = new MutationObserver(() => {
            this.recalcOverflowItems();
        });
        mutationObserver.observe(visibleArea, { childList: true });
        this.setOverflowMenu('mutationObserver', mutationObserver);

        // ── 9. 初始计算 ──

        requestAnimationFrame(() => {
            this.recalcOverflowItems();
        });

        // ── 10. 清理 ──

        this.onCleanup(() => {
            document.removeEventListener('click', onDocumentClick);
            resizeObserver.disconnect();
            mutationObserver.disconnect();

            triggerBtn.remove();
            menuPanel.remove();

            container.classList.remove('q-overflow-menu-container', `q-overflow-menu-container--${direction}`);

            // 将子节点从可见区域移回容器
            while (visibleArea.firstChild) {
                container.insertBefore(visibleArea.firstChild, visibleArea);
            }
            visibleArea.remove();
        });
    },

    // ─── 重新计算溢出项 ───

    /**
     * 重新计算哪些子项溢出，更新菜单内容
     */
    recalcOverflowItems(): void {
        const visibleArea = this.getOverflowMenu('visibleArea') as HTMLElement | null;
        const triggerBtn = this.getOverflowMenu('triggerBtn') as HTMLElement | null;
        const menuPanel = this.getOverflowMenu('menuPanel') as HTMLElement | null;
        const direction = this.getOverflowMenu('direction') as OverflowDirection;
        const maxVisibleItems = this.getOverflowMenu('maxVisibleItems') as number;

        if (!visibleArea || !triggerBtn || !menuPanel) return;

        const containerRect = this.el.getBoundingClientRect();
        const children = Array.from(visibleArea.children) as HTMLElement[];

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
                child.style.display = 'none';
                overflowItems.push({
                    key: child.getAttribute('data-key') ?? `item-${i}`,
                    label: child.getAttribute('data-label') ?? child.textContent ?? `项 ${i + 1}`,
                    element: child,
                });
            } else {
                child.style.display = '';
            }
        }

        // 更新触发按钮显隐
        triggerBtn.style.display = overflowItems.length > 0 ? '' : 'none';

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
        const menuPanel = this.getOverflowMenu('menuPanel') as HTMLElement | null;
        const triggerBtn = this.getOverflowMenu('triggerBtn') as HTMLElement | null;
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

        menuPanel.style.display = '';
        triggerBtn.classList.add('q-overflow-menu__trigger--active');

        this.setOverflowMenu('isMenuOpen', true);
    },

    // ─── 关闭菜单 ───

    /**
     * 关闭下拉菜单
     */
    closeOverflowMenu(): void {
        const menuPanel = this.getOverflowMenu('menuPanel') as HTMLElement | null;
        const triggerBtn = this.getOverflowMenu('triggerBtn') as HTMLElement | null;

        if (!menuPanel || !triggerBtn) return;

        menuPanel.style.display = 'none';
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
