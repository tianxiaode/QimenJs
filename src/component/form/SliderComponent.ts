import { FormFieldComponent } from './FormFieldComponent';
import { Definitions } from '@/composable';
import './slider.css';

const SliderComponentDefs: Definitions = {
    options: {
        value: 0,
        min: 0,
        max: 100,
        step: 1,
        showValue: true,
        fieldType: 'slider',
    },
} as const;

class SliderComponent extends FormFieldComponent {
    static type = 'slider';

    _getBodyItem(): any {
        return this._fieldItem;
    }

    _onValueOptionChange(value: number): void {
        const bodyItem = this._getBodyItem();
        if (bodyItem) bodyItem.value = value;
    }

    _onMinOptionChange(value: number): void {
        const bodyItem = this._getBodyItem();
        if (bodyItem) bodyItem.min = value;
    }

    _onMaxOptionChange(value: number): void {
        const bodyItem = this._getBodyItem();
        if (bodyItem) bodyItem.max = value;
    }

    _onStepOptionChange(value: number): void {
        const bodyItem = this._getBodyItem();
        if (bodyItem) bodyItem.step = value;
    }

    _onShowValueOptionChange(value: boolean): void {
        const bodyItem = this._getBodyItem();
        if (bodyItem) bodyItem.showValue = value;
    }

    _onDisableOptionChange(value: boolean): void {
        const cls = `${this._cssPrefix}--disabled`;
        value ? this.addCls(cls) : this.removeCls(cls);
        const bodyItem = this._getBodyItem();
        if (bodyItem) bodyItem.disable = value;
    }

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-slider');
        const bodyItem = this._getBodyItem();
        if (bodyItem) {
            bodyItem.on('sliderChange', (ctx: any) => {
                this.value = ctx?.data?.value ?? ctx;
                this.emit('slider:change', { value: this.value });
                if (this._shouldValidate('change')) this._doValidate();
            });
        }
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { value: this.value };
    }

    getFormValue(): any {
        return this.value;
    }

    setFormValue(v: any): void {
        this.value = typeof v === 'number' ? v : parseFloat(String(v));
    }

    formReset(defaultValue?: any): void {
        const num =
            defaultValue !== undefined
                ? typeof defaultValue === 'number'
                    ? defaultValue
                    : parseFloat(String(defaultValue))
                : this.min;
        this.value = isNaN(num as number) ? this.min : num;
        this.error = '';
    }
}

SliderComponent.define(SliderComponentDefs);

export { SliderComponent };
export type SliderComponentInstance = InstanceType<typeof SliderComponent>;
