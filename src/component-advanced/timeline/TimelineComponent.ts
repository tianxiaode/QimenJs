/**
 * TimelineComponent 时间线组件
 *
 * 从 ItemGroupPooledComponent 派生（池化、数据驱动、order 排序）。
 * 与 StepComponent 同父兄弟 —— 共享"数据驱动节点序列"抽象，
 * 但不含 Step 的 activeIndex 状态机，仅做 color 标记 + pending 虚线。
 *
 * 子项默认类型：TimelineItem（title/description/timestamp/color/dot）。
 * 方向固定纵向。
 *
 * @example
 * ```ts
 * new TimelineComponent({
 *     items: [
 *         { title: '创建项目', description: '2024-01-01', color: 'primary' },
 *         { title: '开发中', description: '2024-02-01' },
 *         { title: '发布上线', description: '2024-03-01', color: 'success' },
 *     ],
 *     pending: true,
 * })
 * ```
 */

import { ItemGroupPooledComponent } from '@qimenjs/component';
import { Definitions } from '@/composable';
import './timeline.css';

export type { TimelineColor } from './TimelineItemComponent';
/** 时间线项 */
export type TimelineItem = Record<string, any>;

const TimelineComponentDefs: Definitions = {
    options: {
        pending: false,
    },
} as const;

class TimelineComponent extends ItemGroupPooledComponent {
    defaultItemType = 'TimelineItem';

    get defaultOptions(): Record<string, any> {
        return { direction: 'vertical' };
    }

    _onPendingOptionChange(value: boolean): void {
        this.toggleCls('q-timeline--pending', value);
    }

    onAfterInit(): void {
        this.addCls('q-timeline');
        (this as any).itemContainer?.el?.classList.add('q-timeline__list');

        super.onAfterInit();
    }

    get items(): TimelineItem[] {
        return this._items.map(item => item.data as TimelineItem);
    }
    set items(value: TimelineItem[]) {
        this.setItems(value);
    }

    get defaultEventData(): Record<string, any> {
        return {
            ...super.defaultEventData,
            pending: this.pending,
            itemCount: this.count,
        };
    }

    update(props?: Record<string, any>): void {
        if (props?.items !== undefined) this.setItems(props.items);
        if (props?.pending !== undefined) this.pending = props.pending;
        super.update(props);
    }
}

TimelineComponent.define(TimelineComponentDefs);

export { TimelineComponent };
/** 时间线实例类型 */
export type TimelineComponentInstance = InstanceType<typeof TimelineComponent>;
