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

import { ItemGroupPooledComponent } from '@qimenjs/component';
import type { StepItemComponent } from './StepItemComponent';
import { DomEventsMap } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import './step.css';

export type { StepStatus } from './StepItemComponent';

const StepComponentDefs: Definitions = {
    options: {
        activeIndex: 0,
    },
} as const;

class StepComponent extends ItemGroupPooledComponent {
    defaultItemType = 'StepItem';

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

    _onActiveIndexOptionChange(value: number, old: number): void {
        if (this._items.length > 0) {
            this._syncStepStatus();
            if (old !== value) {
                this.emit('select', { index: value, prevIndex: old });
            }
        }
    }

    onAfterInit(): void {
        this.addCls('q-step');
        const container = (this as any).itemContainer?.el as HTMLElement | undefined;
        if (container) container.classList.add('q-step__items');

        super.onAfterInit();

        this._syncStepStatus();
    }

    private _syncStepStatus(): void {
        for (let i = 0; i < this.count; i++) {
            const item = this.getAt(i) as StepItemComponent;
            item.setActiveIndex(i, this.activeIndex);
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
            activeIndex: this.activeIndex,
            stepCount: this.count,
        };
    }

    update(props?: Record<string, any>): void {
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

StepComponent.define(StepComponentDefs);

export { StepComponent };
/** 步骤条实例类型 */
export type StepComponentInstance = InstanceType<typeof StepComponent>;
