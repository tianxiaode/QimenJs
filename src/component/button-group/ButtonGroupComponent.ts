/**
 * ButtonGroupComponent 按钮组组件
 *
 * 从 ItemGroupComponent 派生，固化按钮组领域逻辑：
 * - 固定 itemType 为 'Toggle'
 * - 固定 eventKey 为 'btn'
 * - 内置选中态管理（单选/多选）
 * - 选中项自动 pressed=true，视觉标记明确
 *
 * 选中模式：
 * - 'single'（默认）：同组只能选一个（radio 行为）
 * - 'multiple'：同组可多选（checkbox 行为）
 *
 * @example
 * ```ts
 * // 单选按钮组
 * new ButtonGroupComponent({
 *     items: [
 *         { text: '日', pressed: true },
 *         { text: '周' },
 *         { text: '月' },
 *     ],
 * })
 *
 * // 多选按钮组
 * new ButtonGroupComponent({
 *     mode: 'multiple',
 *     items: [
 *         { text: '粗体', icon: 'B' },
 *         { text: '斜体', icon: 'I' },
 *         { text: '下划线', icon: 'U' },
 *     ],
 * })
 * ```
 */

import { ItemGroupComponent } from '../itemgroup/ItemGroupComponent';

export type ButtonGroupMode = 'single' | 'multiple';

export interface ButtonGroupProps {
    direction?: 'horizontal' | 'vertical';
    items?: Record<string, any>[];
    gap?: string;
    cls?: string;
    itemsCls?: string;
    mode?: ButtonGroupMode;
    selectedIndex?: number;
    selectedIndices?: number[];
}

export let ButtonGroupComponent = class extends ItemGroupComponent {
    private _mode: ButtonGroupMode;

    constructor(props?: ButtonGroupProps) {
        super({
            itemType: 'Toggle',
            eventKey: 'btn',
            events: ['toggle'],
            direction: props?.direction ?? 'horizontal',
            gap: props?.gap ?? '2px',
            cls: props?.cls,
            itemsCls: props?.itemsCls,
            items: props?.items,
        });

        this.type = 'ButtonGroup';
        this.el.classList.remove('q-itemgroup');
        this.el.classList.add('q-button-group');

        this._mode = props?.mode ?? 'single';
        this.el.classList.toggle('q-button-group--multiple', this._mode === 'multiple');

        // 监听子项 toggle 事件
        this.on('btn:toggle', (data: any) => {
            this._onItemToggle(data);
        });

        // 初始选中
        if (this._mode === 'single' && props?.selectedIndex !== undefined) {
            this.selectAt(props.selectedIndex, true);
        }
        if (this._mode === 'multiple' && props?.selectedIndices?.length) {
            for (const idx of props.selectedIndices) {
                this.pressAt(idx, true, true);
            }
        }
    }

    get mode(): ButtonGroupMode {
        return this._mode;
    }

    /** 单选：当前选中索引，-1 表示无选中 */
    get selectedIndex(): number {
        for (let i = 0; i < this.count; i++) {
            if (this.getAt(i)?.pressed) return i;
        }
        return -1;
    }

    /** 多选：所有选中索引 */
    get selectedIndices(): number[] {
        const indices: number[] = [];
        for (let i = 0; i < this.count; i++) {
            if (this.getAt(i)?.pressed) indices.push(i);
        }
        return indices;
    }

    /** 单选：选中指定索引 */
    selectAt(index: number, silent: boolean = false): void {
        if (index < 0 || index >= this.count) return;

        // 取消其他
        for (let i = 0; i < this.count; i++) {
            const item = this.getAt(i);
            if (item?.pressed && i !== index) {
                item.pressed = false;
            }
        }

        // 激活目标
        const target = this.getAt(index);
        if (target && !target.pressed) {
            target.pressed = true;
        }

        if (!silent) {
            this.emit('select', { index, item: target }, { source: 'btn' });
        }
    }

    /** 多选：设置指定索引的 pressed 状态 */
    pressAt(index: number, pressed: boolean, silent: boolean = false): void {
        if (index < 0 || index >= this.count) return;
        const item = this.getAt(index);
        if (item) {
            item.pressed = pressed;
        }
        if (!silent) {
            this.emit('select', { index, pressed, item }, { source: 'btn' });
        }
    }

    /** 子项 toggle 事件处理 */
    private _onItemToggle(data: any): void {
        const index = data?.index;
        if (index === undefined) return;

        const item = this.getAt(index);
        if (!item) return;

        if (this._mode === 'single') {
            // 单选：点击未选中项才切换，点击已选中项不取消
            if (item.pressed) {
                this.selectAt(index);
            } else {
                // 用户点击取消选中 → 恢复选中（单选不允许取消）
                item.pressed = true;
            }
        }
        // 多选模式：ToggleComponent 自己处理 pressed 翻转，无需干预
    }

    update(props?: Record<string, any>): void {
        super.update(props);
        if (props?.mode !== undefined) {
            this._mode = props.mode;
            this.el.classList.toggle('q-button-group--multiple', this._mode === 'multiple');
        }
        if (props?.selectedIndex !== undefined) {
            this.selectAt(props.selectedIndex);
        }
    }
};

export type ButtonGroupComponent = InstanceType<typeof ButtonGroupComponent>;
