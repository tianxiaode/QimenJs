/**
 * TabBarComponent 标签栏组件
 *
 * 从 ItemGroupComponent 派生，固化标签栏领域逻辑：
 * - 固定 itemType 为 'Toggle'
 * - 固定 eventKey 为 'tab'
 * - 内置单选管理（selectedIndex）
 * - active 标签底部粗线指示
 *
 * 可独立使用（导航、筛选等），也可被 TabsComponent 组合。
 *
 * @example
 * ```ts
 * // 独立标签栏
 * new TabBarComponent({
 *     items: [{ text: '全部' }, { text: '进行中' }, { text: '已完成' }],
 *     selectedIndex: 0,
 * })
 *
 * tabBar.on('select', ({ index }) => { ... })
 * ```
 */

import { ItemGroupComponent } from '../itemgroup/ItemGroupComponent';

export interface TabBarProps {
    direction?: 'horizontal' | 'vertical';
    items?: Record<string, any>[];
    gap?: string;
    cls?: string;
    itemsCls?: string;
    selectedIndex?: number;
}

export let TabBarComponent = class extends ItemGroupComponent {
    private _selectedIndex: number = -1;

    constructor(props?: TabBarProps) {
        super({
            itemType: 'Toggle',
            eventKey: 'tab',
            events: ['toggle'],
            direction: props?.direction ?? 'horizontal',
            gap: props?.gap ?? '0',
            cls: props?.cls,
            itemsCls: props?.itemsCls,
            items: props?.items,
        });

        this.type = 'TabBar';
        this.el.classList.remove('q-itemgroup');
        this.el.classList.add('q-tab-bar');

        this.on('tab:toggle', (data: any) => {
            this._onItemToggle(data);
        });

        if (props?.selectedIndex !== undefined && props.selectedIndex >= 0) {
            this.selectAt(props.selectedIndex, true);
        }
    }

    get selectedIndex(): number {
        return this._selectedIndex;
    }

    selectAt(index: number, silent: boolean = false): void {
        if (index < 0 || index >= this.count) return;
        if (index === this._selectedIndex) return;

        if (this._selectedIndex >= 0 && this._selectedIndex < this.count) {
            const prevItem = this.getAt(this._selectedIndex);
            if (prevItem) prevItem.pressed = false;
        }

        const newItem = this.getAt(index);
        if (newItem) newItem.pressed = true;
        this._selectedIndex = index;

        if (!silent) {
            this.emit('select', { index }, { source: 'tab' });
        }
    }

    private _onItemToggle(data: any): void {
        const index = data?.index;
        if (index === undefined) return;

        const item = this.getAt(index);
        if (!item) return;

        if (item.pressed) {
            this.selectAt(index);
        } else {
            item.pressed = true;
        }
    }

    update(props?: Record<string, any>): void {
        super.update(props);
        if (props?.selectedIndex !== undefined) {
            this.selectAt(props.selectedIndex);
        }
    }
};

export type TabBarComponent = InstanceType<typeof TabBarComponent>;
