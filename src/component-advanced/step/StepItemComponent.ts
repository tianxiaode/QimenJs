import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { STEP_ITEM_TPL } from './step-item-tpl';

export type StepStatus = 'wait' | 'process' | 'finish' | 'error';

const StepItemComponentDefs: Definitions = {
    options: {
        title: '',
        description: '',
        icon: '',
        status: 'wait',
        index: 0,
    },
} as const;

class StepItemComponent extends Component {
    static type = 'step-item';

    get tpl(): TemplateDecl {
        return STEP_ITEM_TPL;
    }

    _onTitleOptionChange(value: string): void {
        this.text = value;
    }

    _onDescriptionOptionChange(value: string): void {
        this.setNodeProp('text', value, 'desc');
        this.setNodeHidden(!value, 'desc');
    }

    _onIconOptionChange(value: string): void {
        this._applyIcon(value);
    }

    _onStatusOptionChange(value: StepStatus): void {
        this._applyStatus(value);
    }

    _onIndexOptionChange(value: number): void {
        if (!this.icon) {
            this.setNodeProp('text', String(value + 1), 'number');
        }
    }

    onAfterInit(): void {
        this._applyIcon(this.icon);
        this._applyStatus(this.status);
        if (!this.icon) {
            this.setNodeProp('text', String(this.index + 1), 'number');
        }
    }

    setActiveIndex(index: number, activeIndex: number): void {
        this.index = index;
        if (index < activeIndex) {
            this.status = 'finish';
        } else if (index === activeIndex) {
            this.status = 'process';
        } else {
            this.status = 'wait';
        }
    }

    setError(): void {
        this.status = 'error';
    }

    private _applyIcon(icon: string): void {
        if (icon) {
            this.setNodeProp('text', icon, 'circle');
            this.setNodeHidden(true, 'number');
        } else {
            this.setNodeProp('text', String(this.index + 1), 'number');
            this.setNodeHidden(false, 'number');
        }
    }

    private _applyStatus(status: StepStatus): void {
        this.removeCls(
            'q-step__item--wait q-step__item--process q-step__item--finish q-step__item--error'
        );
        this.addCls(`q-step__item--${status}`);
    }

    get defaultEventData(): Record<string, any> {
        return {
            ...super.defaultEventData,
            index: this.index,
            status: this.status,
        };
    }
}

StepItemComponent.define(StepItemComponentDefs);

export { StepItemComponent };
export type StepItemComponentInstance = InstanceType<typeof StepItemComponent>;
