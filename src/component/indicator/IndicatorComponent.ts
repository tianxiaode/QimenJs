/**
 * IndicatorComponent 指示器浮层组件
 *
 * 从 ItemGroupStaticComponent 派生，指示项本身就是 ItemGroup。
 * 作为浮层挂载到 OverlayRoot，和 Badge/Tooltip 同级。
 *
 * 通过 onOverlayChange 接收宿主的 activeIndex 变化，
 * 通过 domEvents 声明式处理用户交互（点击指示项/箭头）。
 *
 * 通信链路：
 *   宿主 → 浮层：updateIndicator({ activeIndex }) → overlayEmit CHANGE → onOverlayChange
 *   浮层 → 宿主：用户点击指示项 → emits: ['change'] → FloatDecl.emits changed → 宿主 indicatorChange
 *
 * 模板节点：
 * - prevBtn   — 上一项箭头按钮
 * - nextBtn   — 下一项箭头按钮
 * - itemContainer — 指示项容器（继承自 ItemGroup）
 *
 * 指示器模式（mode）：
 * - dot    — 圆点（默认）
 * - number — 数字列表（1, 2, 3...）
 * - dash   — 横线
 *
 * 使用方式（在父组件 indicator 配置中声明）：
 * ```ts
 * new ItemGroupPooledComponent({
 *     items: [...],
 *     indicator: { type: 'number', placement: 'bottom', arrows: true },
 * })
 * ```
 */

import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';
import { DomEventsMap } from '@qimenjs/component-core';
import { INDICATOR_TPL } from './indicator-tpl';

/** 指示器模式类型 */
export type IndicatorMode = 'dot' | 'number' | 'dash';

/** 指示器属性接口 */
export interface IndicatorProps {
    count?: number;
    activeIndex?: number;
    arrows?: boolean;
    anchor?: HTMLElement;
    mode?: IndicatorMode;
}

class IndicatorComponent extends ItemGroupStaticComponent {
    _activeIndex: number = -1;
    _arrows: boolean = false;
    _mode: IndicatorMode = 'dot';

    domEvents?: DomEventsMap | undefined = {
        click: {
            prevBtn: {
                handler: 'onPrevBtnClick',
            },
            nextBtn: {
                handler: 'onNextBtnClick',
            },
        },
    };

    onAfterInit(props?: IndicatorProps): void {
        this._initIndicatorOverlay(props);
    }

    onPrevBtnClick(): void {
        if (this._activeIndex > 0) {
            this.activeIndex = this._activeIndex - 1;
            this.emit('change', { index: this._activeIndex });
        }
    }

    onNextBtnClick(): void {
        if (this._activeIndex < this.count - 1) {
            this.activeIndex = this._activeIndex + 1;
            this.emit('change', { index: this._activeIndex });
        }
    }

    _initIndicatorOverlay(props?: IndicatorProps): void {
        if (props?.mode) {
            this._mode = props.mode;
        }
        this.addCls('q-indicator');
        this.addCls(`q-indicator--${this._mode}`);

        if (props?.arrows) {
            this._arrows = props.arrows;
            this.setNodeHidden(false, 'prevBtn');
            this.setNodeHidden(false, 'nextBtn');
            this.addCls('q-indicator--arrows');
        }
        if (props?.activeIndex !== undefined) {
            this._activeIndex = props.activeIndex;
        }
    }

    get activeIndex(): number {
        return this._activeIndex;
    }
    set activeIndex(value: number) {
        if (value === this._activeIndex) return;
        const prevIndex = this._activeIndex;
        this._activeIndex = value;
        this._applyActive();
        this.emit('change', { index: value, prevIndex });
    }

    get mode(): IndicatorMode {
        return this._mode;
    }
    set mode(value: IndicatorMode) {
        if (value === this._mode) return;
        this.removeCls(`q-indicator--${this._mode}`);
        this._mode = value;
        this.addCls(`q-indicator--${this._mode}`);
        this._applyModeToItems();
    }

    _applyActive(): void {
        for (let i = 0; i < this.count; i++) {
            const item = this.getAt(i);
            if (item) {
                item.toggleCls?.('q-indicator__item--active', i === this._activeIndex);
            }
        }
    }

    _applyModeToItems(): void {
        for (let i = 0; i < this.count; i++) {
            const item = this.getAt(i);
            if (item?.update) {
                item.update({ mode: this._mode });
            }
        }
    }

    override setItems(datas: Record<string, any>[]): void {
        const enriched = datas.map((data, index) => ({
            ...data,
            mode: data.mode ?? this._mode,
            index: data.index ?? index,
        }));
        super.setItems(enriched);
        this._applyActive();
    }

    onOverlayChange(data: any): void {
        if (!data) return;
        if (data.mode !== undefined) this.mode = data.mode;
        if (data.activeIndex !== undefined) this.activeIndex = data.activeIndex;
        if (data.items) this.setItems(data.items);
        if (data.arrows !== undefined) {
            this._arrows = data.arrows;
            this.setNodeHidden(!data.arrows, 'prevBtn');
            this.setNodeHidden(!data.arrows, 'nextBtn');
            this.toggleCls('q-indicator--arrows', data.arrows);
        }
    }

    update(props?: Partial<IndicatorProps>): void {
        if (props?.mode !== undefined) this.mode = props.mode;
        if (props?.activeIndex !== undefined) this.activeIndex = props.activeIndex;
        if (props?.arrows !== undefined) {
            this._arrows = props.arrows;
            this.setNodeHidden(!props.arrows, 'prevBtn');
            this.setNodeHidden(!props.arrows, 'nextBtn');
            this.toggleCls('q-indicator--arrows', props.arrows);
        }
    }
}

IndicatorComponent.useTemplate(INDICATOR_TPL);
export { IndicatorComponent };
/** 指示器实例类型 */
export type IndicatorComponentInstance = InstanceType<typeof IndicatorComponent>;
