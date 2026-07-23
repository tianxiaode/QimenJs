/**
 * MenuItemManageAbility — 菜单项管理能力
 *
 * 管理 MenuItemComponent 实例的增删改和状态，支持池化复用。
 * 可混入任何需要菜单项管理的组件（MenuComponent、Toolbar 等）。
 *
 * 核心策略：
 * - 池化复用：关闭=隐藏，再次打开只更新属性，不够才新增
 * - 状态保存在 abilityState 中（_menuItemPool / _menuItemMap）
 * - 销毁时调用每个 menuItem 的 dispose 方法
 *
 * 宿主需要：
 * - 提供一个容器元素（通过 getMenuItemContainer 指定，默认取 nodeMap.menu.content 或 this.el）
 * - 从 ComponentRegistrar 查找 MenuItemComponent 类
 *
 * @example
 * ```js
 * // 给菜单组件加菜单项管理能力
 * const MenuBase = TemplateComponent.withTemplate(MENU_TEMPLATE).with([MenuItemManageAbility]);
 *
 * // 运行时操作
 * menu.setMenuItems([
 *     { text: '新建', icon: '📄', shortcut: 'Ctrl+N' },
 *     { text: '打开', icon: '📂', disabled: true },
 *     { text: '保存', icon: '💾', hasSubmenu: true },
 * ]);
 * menu.updateMenuItem(1, { disabled: false });
 * menu.removeMenuItem(2);
 * ```
 */

import type { AbilityDefinition } from '@/composable';
import { ComponentRegistrar } from '@qimenjs/component-core';

// ─── 菜单项配置 ────────────────────────────────────────

export interface MenuItemConfig {
    /** 菜单项标识 */
    key?: string;
    /** 菜单项文本 */
    text?: string;
    /** 图标 */
    icon?: string;
    /** 快捷键文本 */
    shortcut?: string;
    /** 是否禁用 */
    disabled?: boolean;
    /** 是否有子菜单 */
    hasSubmenu?: boolean;
    /** 选中回调 */
    onSelect?: (item: any) => void;
    /** 子菜单配置 */
    submenuProps?: Record<string, any>;
}

// ─── 能力定义 ──────────────────────────────────────────

export const MenuItemManageAbility= {
    // ─── 属性访问方法 ───

    /**
     * 获取菜单项管理属性
     */
    getMenuItemManage(key: string): any {
        return this.abilityState(`MenuItemManageAbility:prop:${key}`);
    },

    /**
     * 设置菜单项管理属性
     */
    setMenuItemManage(key: string, value: any): void {
        this.setAbilityState(`MenuItemManageAbility:prop:${key}`, value);
    },

    // ─── 容器 ───

    /**
     * 获取菜单项容器元素
     *
     * 优先取 nodeMap.menu.content，其次取 this.el
     */
    getMenuItemContainer(): HTMLElement {
        const contentEl = this.nodeMap?.['content']?.el as HTMLElement | undefined;
        return contentEl ?? this.el;
    },

    // ─── 池化管理 ───

    /**
     * 获取菜单项池（懒初始化）
     */
    getMenuItemPool(): any[] {
        return this.abilityState('MenuItemManageAbility:pool', () => []);
    },

    /**
     * 获取菜单项映射 key → instance（懒初始化）
     */
    getMenuItemMap(): Map<string, any> {
        return this.abilityState('MenuItemManageAbility:map', () => new Map());
    },

    // ─── 批量设置（池化复用核心） ───

    /**
     * 批量设置菜单项（池化复用）
     *
     * - 复用已有 menuItem，只更新属性
     * - 不够才新增
     * - 多余的隐藏，不销毁
     *
     * @param configs - 菜单项配置数组
     */
    setMenuItems(configs: MenuItemConfig[]): void {
        const pool = this.getMenuItemPool();
        const container = this.getMenuItemContainer();
        const MenuItemClass = this._getMenuItemClass();

        if (!MenuItemClass || !container) return;

        for (let i = 0; i < configs.length; i++) {
            const config = configs[i];

            if (i < pool.length) {
                // 复用：只更新属性
                const item = pool[i];
                item.update(config);
                item.el.hidden = false;
            } else {
                // 不够：新增
                const item = new MenuItemClass(config);
                pool.push(item);
                container.appendChild(item.el);
            }

            // 更新 key 映射
            if (config.key) {
                this.getMenuItemMap().set(config.key, pool[i]);
            }
        }

        // 多余：隐藏
        for (let i = configs.length; i < pool.length; i++) {
            pool[i].el.hidden = true;
        }

        this.setMenuItemManage('itemCount', configs.length);
    },

    // ─── 单项操作 ───

    /**
     * 按索引更新菜单项
     *
     * @param index - 菜单项索引
     * @param config - 要更新的属性
     */
    updateMenuItem(index: number, config: Partial<MenuItemConfig>): void {
        const pool = this.getMenuItemPool();
        if (index < 0 || index >= pool.length) return;

        const item = pool[index];
        item.update(config);

        // 更新 key 映射
        if (config.key) {
            this.getMenuItemMap().set(config.key, item);
        }
    },

    /**
     * 按 key 更新菜单项
     *
     * @param key - 菜单项标识
     * @param config - 要更新的属性
     */
    updateMenuItemByKey(key: string, config: Partial<MenuItemConfig>): void {
        const item = this.getMenuItemMap().get(key);
        if (!item) return;
        item.update(config);
    },

    /**
     * 按索引移除菜单项
     *
     * @param index - 菜单项索引
     * @param destroy - 是否销毁实例（默认 false，只隐藏）
     */
    removeMenuItem(index: number, destroy: boolean = false): void {
        const pool = this.getMenuItemPool();
        if (index < 0 || index >= pool.length) return;

        const item = pool[index];

        if (destroy) {
            item.dispose();
            pool.splice(index, 1);
        } else {
            item.el.hidden = true;
        }
    },

    /**
     * 按 key 移除菜单项
     *
     * @param key - 菜单项标识
     * @param destroy - 是否销毁实例（默认 false，只隐藏）
     */
    removeMenuItemByKey(key: string, destroy: boolean = false): void {
        const item = this.getMenuItemMap().get(key);
        if (!item) return;

        const pool = this.getMenuItemPool();
        const index = pool.indexOf(item);

        if (index >= 0) {
            this.removeMenuItem(index, destroy);
        }

        this.getMenuItemMap().delete(key);
    },

    /**
     * 在指定位置插入菜单项
     *
     * @param index - 插入位置
     * @param config - 菜单项配置
     */
    insertMenuItem(index: number, config: MenuItemConfig): void {
        const pool = this.getMenuItemPool();
        const container = this.getMenuItemContainer();
        const MenuItemClass = this._getMenuItemClass();

        if (!MenuItemClass || !container) return;

        const item = new MenuItemClass(config);
        pool.splice(index, 0, item);

        // DOM 插入
        if (index < container.children.length) {
            container.insertBefore(item.el, container.children[index]);
        } else {
            container.appendChild(item.el);
        }

        // key 映射
        if (config.key) {
            this.getMenuItemMap().set(config.key, item);
        }

        const count = this.getMenuItemManage('itemCount') ?? 0;
        this.setMenuItemManage('itemCount', count + 1);
    },

    // ─── 查询 ───

    /**
     * 按索引获取菜单项实例
     */
    getMenuItem(index: number): any {
        const pool = this.getMenuItemPool();
        return pool[index] ?? null;
    },

    /**
     * 按 key 获取菜单项实例
     */
    getMenuItemByKey(key: string): any {
        return this.getMenuItemMap().get(key) ?? null;
    },

    /**
     * 获取当前可见的菜单项数量
     */
    getMenuItemCount(): number {
        return this.getMenuItemManage('itemCount') ?? 0;
    },

    /**
     * 获取所有菜单项实例
     */
    getAllMenuItems(): any[] {
        return [...this.getMenuItemPool()];
    },

    // ─── 全量销毁 ───

    /**
     * 销毁所有菜单项实例
     *
     * 调用每个 menuItem 的 dispose 方法，清空池和映射。
     */
    disposeAllMenuItems(): void {
        const pool = this.getMenuItemPool();

        for (const item of pool) {
            if (typeof item.dispose === 'function') {
                item.dispose();
            }
        }

        pool.length = 0;
        this.getMenuItemMap().clear();
        this.setMenuItemManage('itemCount', 0);
    },

    // ─── 内部方法 ───

    /**
     * 从 ComponentRegistrar 查找 MenuItemComponent 类
     */
    _getMenuItemClass(): any {
        const cached = this.getMenuItemManage('menuItemClass');
        if (cached) return cached;

        const MenuItemClass = ComponentRegistrar.getInstance().get('MenuItem');
        if (MenuItemClass) {
            this.setMenuItemManage('menuItemClass', MenuItemClass);
        }
        return MenuItemClass;
    },
} satisfies AbilityDefinition;
