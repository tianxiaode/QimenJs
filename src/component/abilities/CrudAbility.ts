/**
 * CrudAbility CRUD 操作能力
 *
 * 为工具栏注入 CRUD 按钮组：新建/编辑/删除/刷新/导入/导出/保存。
 * 所有按钮通过 position 排序，可通过配置显隐。
 *
 * @example
 * ```js
 * // 给任意 Toolbar 加 CRUD
 * class MyToolbar extends ComponentBase {
 *     static abilities = [LayoutAbility, ChildrenAbility, ToolbarAbility, CrudAbility];
 * }
 *
 * // 布局定义
 * { type: 'MyToolbar', showCreate: true, showDelete: true, showExport: true }
 *
 * // 运行时
 * toolbar.showButton('import');
 * toolbar.hideButton('delete');
 * ```
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { CRUD_EVENTS } from '../events';

/** CRUD 按钮位置常量 */
export const CRUD_POSITIONS = {
    CREATE: 10,
    EDIT: 20,
    DELETE: 30,
    SEPARATOR_1: 35,
    REFRESH: 40,
    SEPARATOR_2: 45,
    IMPORT: 50,
    EXPORT: 60,
    SEPARATOR_3: 65,
    SAVE: 70,
} as const;

/** CRUD 按钮配置 */
interface CrudButtonConfig {
    visible: boolean;
    text: string;
    icon: string;
    position: number;
    separatorBefore?: number;
}

/** 默认按钮配置 */
const DEFAULT_BUTTONS: Record<string, CrudButtonConfig> = {
    create:  { visible: true,  text: '新建', icon: '➕', position: CRUD_POSITIONS.CREATE },
    edit:    { visible: true,  text: '编辑', icon: '✏️', position: CRUD_POSITIONS.EDIT },
    delete:  { visible: true,  text: '删除', icon: '🗑️', position: CRUD_POSITIONS.DELETE },
    refresh: { visible: true,  text: '刷新', icon: '🔄', position: CRUD_POSITIONS.REFRESH, separatorBefore: CRUD_POSITIONS.SEPARATOR_1 },
    import:  { visible: false, text: '导入', icon: '📥', position: CRUD_POSITIONS.IMPORT, separatorBefore: CRUD_POSITIONS.SEPARATOR_2 },
    export:  { visible: true,  text: '导出', icon: '📤', position: CRUD_POSITIONS.EXPORT },
    save:    { visible: false, text: '保存', icon: '💾', position: CRUD_POSITIONS.SAVE, separatorBefore: CRUD_POSITIONS.SEPARATOR_3 },
};

/** 按钮排列顺序 */
const BUTTON_ORDER = ['create', 'edit', 'delete', 'refresh', 'import', 'export', 'save'];

export const CrudAbility: AbilityDefinition = {
    /**
     * CRUD 按钮配置表
     */
    crudButtons: {
        get(): Record<string, CrudButtonConfig> {
            return this.abilityState('CrudAbility:buttons', () => {
                // 深拷贝默认配置
                const copy: Record<string, CrudButtonConfig> = {};
                for (const [k, v] of Object.entries(DEFAULT_BUTTONS)) {
                    copy[k] = { ...v };
                }
                return copy;
            });
        },
    },

    // ============================================
    // 显隐控制
    // ============================================

    showButton(name: string): any {
        const btn = this.crudButtons[name];
        if (btn) {
            btn.visible = true;
            this.renderCrud?.();
        }
        return this;
    },

    hideButton(name: string): any {
        const btn = this.crudButtons[name];
        if (btn) {
            btn.visible = false;
            this.renderCrud?.();
        }
        return this;
    },

    toggleButton(name: string): any {
        const btn = this.crudButtons[name];
        if (btn) {
            btn.visible = !btn.visible;
            this.renderCrud?.();
        }
        return this;
    },

    isButtonVisible(name: string): boolean {
        return this.crudButtons[name]?.visible ?? false;
    },

    // ============================================
    // 渲染
    // ============================================

    renderCrud(): void {
        if (!this.el) return;

        // 移除旧 CRUD 元素
        const oldItems = this.el.querySelectorAll('[data-crud]');
        oldItems.forEach((el: Element) => el.remove());

        const frag = document.createDocumentFragment();
        let hasPrevVisible = false;

        for (const name of BUTTON_ORDER) {
            const config = this.crudButtons[name];
            if (!config?.visible) continue;

            // 分隔符
            if (config.separatorBefore && hasPrevVisible) {
                const sep = document.createElement('div');
                sep.className = 'q-separator q-separator--vertical';
                sep.setAttribute('data-crud', 'separator');
                sep.setAttribute('data-position', String(config.separatorBefore));
                frag.appendChild(sep);
            }

            const btn = document.createElement('button');
            btn.className = 'q-crud-toolbar__btn q-button';
            btn.setAttribute('data-crud', name);
            btn.setAttribute('data-position', String(config.position));
            btn.setAttribute('data-action', name);
            btn.textContent = `${config.icon || ''} ${config.text || name}`.trim();
            btn.addEventListener('click', () => {
                this.emit?.(CRUD_EVENTS.ACTION, { action: name });
            });
            frag.appendChild(btn);

            hasPrevVisible = true;
        }

        this.el.appendChild(frag);
    },

    /**
     * 从 props 初始化
     */
    __initProps(props: Record<string, any>): void {
        const buttons = this.crudButtons;
        for (const [key, config] of Object.entries(buttons) as [string, CrudButtonConfig][]) {
            const propKey = `show${key.charAt(0).toUpperCase() + key.slice(1)}`;
            if (props[propKey] !== undefined) config.visible = props[propKey];
            if (props[`${key}Text`]) config.text = props[`${key}Text`];
            if (props[`${key}Icon`]) config.icon = props[`${key}Icon`];
        }
    },
};
