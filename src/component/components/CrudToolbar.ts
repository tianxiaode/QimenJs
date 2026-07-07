/**
 * CrudToolbar CRUD 工具栏
 *
 * 内置增删改查操作按钮：新建/编辑/删除/刷新/导入/导出/保存。
 * 所有按钮通过 position 排序，可通过配置显隐。
 *
 * @example
 * ```js
 * {
 *   type: 'CrudToolbar',
 *   showCreate: true,
 *   showEdit: true,
 *   showDelete: true,
 *   showRefresh: true,
 *   showImport: false,
 *   showExport: true,
 *   showSave: false,
 * }
 * ```
 */

import { ToolbarComponent } from './ToolbarComponent';

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

/** CRUD 按钮配置接口 */
export interface CrudButtonConfig {
    /** 是否显示 */
    visible?: boolean;
    /** 按钮文本 */
    text?: string;
    /** 按钮图标 */
    icon?: string;
}

export class CrudToolbar extends ToolbarComponent {
    /** 按钮配置 */
    private _buttons: Record<string, CrudButtonConfig> = {
        create:  { visible: true, text: '新建', icon: '➕' },
        edit:    { visible: true, text: '编辑', icon: '✏️' },
        delete:  { visible: true, text: '删除', icon: '🗑️' },
        refresh: { visible: true, text: '刷新', icon: '🔄' },
        import:  { visible: false, text: '导入', icon: '📥' },
        export:  { visible: true, text: '导出', icon: '📤' },
        save:    { visible: false, text: '保存', icon: '💾' },
    };

    constructor(props?: Record<string, any>) {
        super(props);

        this.el.className = 'q-crud-toolbar q-toolbar q-flex q-flex-row';

        // 从 props 合并按钮配置
        if (props) {
            for (const [key, config] of Object.entries(this._buttons)) {
                const propKey = `show${key.charAt(0).toUpperCase() + key.slice(1)}` as string;
                if (props[propKey] !== undefined) {
                    config.visible = props[propKey];
                }
                if (props[`${key}Text`]) {
                    config.text = props[`${key}Text`];
                }
                if (props[`${key}Icon`]) {
                    config.icon = props[`${key}Icon`];
                }
            }
        }

        this.renderCrudButtons();
    }

    /** 显示指定按钮 */
    showButton(name: string): void {
        if (this._buttons[name]) {
            this._buttons[name].visible = true;
            this.renderCrudButtons();
        }
    }

    /** 隐藏指定按钮 */
    hideButton(name: string): void {
        if (this._buttons[name]) {
            this._buttons[name].visible = false;
            this.renderCrudButtons();
        }
    }

    /** 切换按钮显隐 */
    toggleButton(name: string): void {
        if (this._buttons[name]) {
            this._buttons[name].visible = !this._buttons[name].visible;
            this.renderCrudButtons();
        }
    }

    /** 判断按钮是否可见 */
    isButtonVisible(name: string): boolean {
        return this._buttons[name]?.visible ?? false;
    }

    /** 渲染 CRUD 按钮 */
    private renderCrudButtons(): void {
        this.el.innerHTML = '';

        const items: Array<{ name: string; position: number; separatorBefore?: number }> = [
            { name: 'create', position: CRUD_POSITIONS.CREATE },
            { name: 'edit', position: CRUD_POSITIONS.EDIT },
            { name: 'delete', position: CRUD_POSITIONS.DELETE },
            { name: 'refresh', position: CRUD_POSITIONS.REFRESH, separatorBefore: CRUD_POSITIONS.SEPARATOR_1 },
            { name: 'import', position: CRUD_POSITIONS.IMPORT, separatorBefore: CRUD_POSITIONS.SEPARATOR_2 },
            { name: 'export', position: CRUD_POSITIONS.EXPORT },
            { name: 'save', position: CRUD_POSITIONS.SAVE, separatorBefore: CRUD_POSITIONS.SEPARATOR_3 },
        ];

        let hasPrevVisible = false;

        for (const item of items) {
            const config = this._buttons[item.name];
            if (!config?.visible) continue;

            // 分隔符：前面有可见按钮时才显示
            if (item.separatorBefore && hasPrevVisible) {
                const sep = document.createElement('div');
                sep.className = 'q-separator q-separator--vertical';
                sep.setAttribute('data-position', String(item.separatorBefore));
                this.el.appendChild(sep);
            }

            const btn = document.createElement('button');
            btn.className = 'q-crud-toolbar__btn q-button';
            btn.setAttribute('data-position', String(item.position));
            btn.setAttribute('data-action', item.name);
            btn.textContent = `${config.icon || ''} ${config.text || item.name}`.trim();
            btn.addEventListener('click', () => {
                this.emit?.('crudaction', { action: item.name });
            });
            this.el.appendChild(btn);

            hasPrevVisible = true;
        }
    }
}
