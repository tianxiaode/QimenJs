/**
 * OverflowMenuAbility — 溢出菜单能力
 *
 * 当子组件超出容器可视范围时：
 * - 横向：在最右边显示下拉箭头，点击弹出菜单显示溢出的子项
 * - 纵向：在最下边显示下拉箭头，点击弹出菜单显示溢出的子项
 *
 * 适用于工具栏、标签栏等横向/纵向溢出容器。
 * 也适用于下拉菜单场景（如 Select 下拉、按钮下拉菜单）。
 *
 * 互斥说明：与 OverflowScrollAbility 互斥，
 * 同一容器不应同时使用两种溢出策略。
 *
 * 实现方式：
 * - 通过 ComponentRegistrar 查找 MenuComponent，创建浮层菜单实例
 * - 菜单项管理委托给 MenuComponent 的 MenuItemManageAbility（池化复用）
 * - 关闭 = 隐藏 MenuComponent，不销毁；再次打开只更新菜单项
 * - 宿主销毁时才真正销毁 MenuComponent
 *
 * 模板约定：
 * - 需要模板预定义以下节点（通过 nodeMap 引用）：
 *   - toolbar:contentArea — 子项容器（兼做可见区域）
 *   - toolbar:triggerBtn — 下拉触发按钮
 * - 不再需要 toolbar:menuPanel，菜单由 MenuComponent 自行管理浮层
 *
 * 事件模式：
 * - 使用 this.emit 发布 overflowmenu/overflowchange 事件
 * - 使用 abilityState / setAbilityState 做数据隔离
 * - 使用 this.onCleanup 注册清理回调
 */

import type { AbilityDefinition } from '@/composable';
import { ComponentRegistrar } from '@qimenjs/component-core';
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
     * 菜单浮层通过 ComponentRegistrar 查找 MenuComponent 创建。
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
        const contentArea = this.nodeMap?.['contentArea']?.el as HTMLElement | undefined;
        const triggerBtn = this.nodeMap?.['triggerBtn']?.el as HTMLElement | undefined;

        if (!contentArea || !triggerBtn) return;

        const container = this.el;

        // ── 1. 设置容器样式 ──

        container.classList.add('q-overflow-menu-container');
        container.classList.add(`q-overflow-menu-container--${direction}`);

        // contentArea 作为可见区域
        contentArea.classList.add('q-overflow-menu__visible');

        // 触发按钮方向样式
        triggerBtn.classList.add(`q-overflow-menu__trigger--${direction}`);

        // ── 2. 点击触发按钮切换菜单 ──

        triggerBtn.addEventListener('click', (e: Event) => {
            e.stopPropagation();
            this.toggleOverflowMenu();
        });

        // ── 3. ResizeObserver 监听容器尺寸变化 ──

        const resizeObserver = new ResizeObserver(() => {
            this.recalcOverflowItems();
        });
        resizeObserver.observe(container);
        this.setOverflowMenu('resizeObserver', resizeObserver);

        // ── 4. MutationObserver 监听子元素变化 ──

        const mutationObserver = new MutationObserver(() => {
            this.recalcOverflowItems();
        });
        mutationObserver.observe(contentArea, { childList: true });
        this.setOverflowMenu('mutationObserver', mutationObserver);

        // ── 5. 初始计算 ──

        requestAnimationFrame(() => {
            this.recalcOverflowItems();
        });

        // ── 6. 清理 ──

        this.onCleanup(() => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();

            container.classList.remove('q-overflow-menu-container', `q-overflow-menu-container--${direction}`);
            container.classList.remove('q-overflow-menu-container--overflowing');

            contentArea.classList.remove('q-overflow-menu__visible');

            // 隐藏触发按钮
            triggerBtn.hidden = true;
            triggerBtn.classList.remove('q-overflow-menu__trigger--active');

            // 还原被隐藏的子项
            const children = Array.from(contentArea.children) as HTMLElement[];
            for (const child of children) {
                child.hidden = false;
            }

            // 销毁 MenuComponent 实例
            const menu = this.getOverflowMenu('menuInstance') as any;
            if (menu) {
                menu.dispose();
                this.setOverflowMenu('menuInstance', null);
            }
        });
    },

    // ─── 重新计算溢出项 ───

    /**
     * 重新计算哪些子项溢出，更新菜单内容
     *
     * 溢出项通过 MenuComponent.setMenuItems 更新，支持池化复用。
     */
    recalcOverflowItems(): void {
        const contentArea = this.nodeMap?.['contentArea']?.el as HTMLElement | null;
        const triggerBtn = this.nodeMap?.['triggerBtn']?.el as HTMLElement | null;
        const direction = this.getOverflowMenu('direction') as OverflowDirection;
        const maxVisibleItems = this.getOverflowMenu('maxVisibleItems') as number;

        if (!contentArea || !triggerBtn) return;

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

        // 委托给 MenuComponent 更新菜单项（池化复用）
        const menu = this._getOrCreateMenu();
        if (menu) {
            menu.setMenuItems(overflowItems.map(item => ({
                key: item.key,
                text: item.label,
                onSelect: () => {
                    this.emit('overflowmenu', {
                        key: item.key,
                        label: item.label,
                        element: item.element,
                        data: item.data,
                    }, { source: this.eventKey });

                    this.closeOverflowMenu();
                },
            })));
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
     *
     * 通过 MenuComponent 的浮层协议打开，定位到触发按钮。
     */
    openOverflowMenu(): void {
        const triggerBtn = this.nodeMap?.['triggerBtn']?.el as HTMLElement | null;
        if (!triggerBtn) return;

        const menu = this._getOrCreateMenu();
        if (!menu) return;

        // 设置锚点为触发按钮，定位菜单
        menu._anchor = triggerBtn;
        menu.open();

        triggerBtn.classList.add('q-overflow-menu__trigger--active');

        this.setOverflowMenu('isMenuOpen', true);
    },

    // ─── 关闭菜单 ───

    /**
     * 关闭下拉菜单
     *
     * 隐藏 MenuComponent，不销毁实例（池化复用）。
     */
    closeOverflowMenu(): void {
        const triggerBtn = this.nodeMap?.['triggerBtn']?.el as HTMLElement | null;
        const menu = this.getOverflowMenu('menuInstance') as any;

        if (menu) {
            menu.close();
        }

        if (triggerBtn) {
            triggerBtn.classList.remove('q-overflow-menu__trigger--active');
        }

        this.setOverflowMenu('isMenuOpen', false);
    },

    // ─── 获取溢出项列表 ───

    /**
     * 获取当前溢出的菜单项
     */
    getOverflowItems(): OverflowMenuItem[] {
        return this.getOverflowMenu('overflowItems') ?? [];
    },

    // ─── 内部方法 ───

    /**
     * 获取或创建 MenuComponent 实例（懒初始化，池化复用）
     *
     * 首次调用时通过 ComponentRegistrar 查找 MenuComponent 并创建实例。
     * 后续调用直接复用已有实例。
     */
    _getOrCreateMenu(): any {
        let menu = this.getOverflowMenu('menuInstance') as any;
        if (menu) return menu;

        const MenuClass = ComponentRegistrar.getInstance().get('Menu');
        if (!MenuClass) return null;

        const direction = this.getOverflowMenu('direction') as OverflowDirection;
        const menuOffset = this.getOverflowMenu('menuOffset') as number;

        menu = new MenuClass({
            anchor: this.el,
            placement: direction === 'horizontal' ? 'bottom-end' : 'left-start',
            offset: menuOffset,
        });

        this.setOverflowMenu('menuInstance', menu);
        return menu;
    },
};
