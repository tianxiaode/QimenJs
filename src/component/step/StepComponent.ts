/**
 * StepComponent 步骤条组件
 *
 * 从 ItemGroupPooledComponent 派生（池化，状态频繁更新），
 * 通过 domEvents 处理子项点击事件。
 *
 * 子项默认类型：StepItem（包含 title/description/icon/status/index）。
 * 状态同步：activeIndex 变化时，批量更新所有子项状态。
 *
 * @example
 * ```ts
 * new StepComponent({
 *     items: [
 *         { title: '账号', description: '填写账号信息' },
 *         { title: '验证', description: '验证身份' },
 *         { title: '完成', description: '注册完成' },
 *     ],
 *     activeIndex: 1,
 * })
 * step.on('stepClick', ({ index }) => { ... })
 * step.activeIndex = 2;
 * ```
 */

import { ItemGroupPooledComponent } from '../itemgroup/ItemGroupPooledComponent';
import type { ItemGroupProps } from '../itemgroup/ItemGroupBaseComponent';
import type { StepItemComponent } from './StepItemComponent';
import { DomEventsMap } from '@qimenjs/component-core';

export type { StepStatus } from './StepItemComponent';
export type { StepItemProps } from './StepItemComponent';

/** 步骤条属性接口 */
export interface StepProps extends ItemGroupProps {
    activeIndex?: number;
    direction?: 'horizontal' | 'vertical';
}

class StepComponent extends ItemGroupPooledComponent {
    _activeIndex: number = 0;

    domEvents?: DomEventsMap | undefined = {
        click: {
            StepItem: {
                handler: '_onStepItemClick',
                emits: ['stepClick'],
            },
        },
    };

    _onStepItemClick(domEvt: any): void {
        const target = this.getTargetItem(domEvt.target);
        if (!target) return;

        const item = target.component as StepItemComponent;
        this.emit('stepClick', { index: item.index, status: item.status });
    }

    onAfterInit(props?: StepProps): void {
        this.addCls('q-step');
        const container = (this as any).itemContainer?.el as HTMLElement | undefined;
        if (container) container.classList.add('q-step__items');

        super.onAfterInit({
            defaultItemType: 'StepItem',
            direction: props?.direction ?? 'horizontal',
            ...props,
        });

        if (props?.activeIndex !== undefined) {
            this._activeIndex = props.activeIndex;
        }

        this._syncStepStatus();
    }

    private _syncStepStatus(): void {
        for (let i = 0; i < this.count; i++) {
            const item = this.getAt(i) as StepItemComponent;
            item.setActiveIndex(i, this._activeIndex);
        }
    }

    get activeIndex(): number {
        return this._activeIndex;
    }
    set activeIndex(v: number) {
        const prevIndex = this._activeIndex;
        this._activeIndex = v;
        this._syncStepStatus();
        if (prevIndex !== v) {
            this.emit('select', { index: v, prevIndex });
        }
    }

    /**
     * 设置某个步骤为错误状态
     */
    setErrorAt(index: number): void {
        if (index < 0 || index >= this.count) return;
        const item = this.getAt(index) as StepItemComponent;
        item.setError();
    }

    get defaultEventData(): Record<string, any> {
        return {
            ...super.defaultEventData,
            activeIndex: this._activeIndex,
            stepCount: this.count,
        };
    }

    update(props?: Partial<StepProps>): void {
        if (props?.items !== undefined) {
            super.update({ items: props.items });
            this._syncStepStatus();
        }
        if (props?.activeIndex !== undefined) this.activeIndex = props.activeIndex;
        if (props?.direction !== undefined) {
            super.update({ direction: props.direction });
        }
    }
}

StepComponent.register();
export { StepComponent };
/** 步骤条实例类型 */
export type StepComponentInstance = InstanceType<typeof StepComponent>;
