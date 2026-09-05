import { FormFieldComponent } from './FormFieldComponent';
import type { TemplateDecl } from '@/component-core';
import { Definitions } from '@/composable';
import { SLIDER_TPL } from './slider-tpl';
import './slider.css';


const SliderComponentDefs: Definitions = {
    options: {
        value: 0,
        min: 0,
        max: 100,
        step: 1,
        showValue: true,
    },
} as const;

class SliderComponent extends FormFieldComponent {
    static type = 'slider';

    get tpl(): TemplateDecl {
        return SLIDER_TPL;
    }

    _onValueOptionChange(value: number): void {
        const bodyCmp = this.getComponent('fieldBody') as any;
        if (bodyCmp) bodyCmp.value = value;
    }

    _onMinOptionChange(value: number): void {
        const bodyCmp = this.getComponent('fieldBody') as any;
        if (bodyCmp) bodyCmp.min = value;
    }

    _onMaxOptionChange(value: number): void {
        const bodyCmp = this.getComponent('fieldBody') as any;
        if (bodyCmp) bodyCmp.max = value;
    }

    _onStepOptionChange(value: number): void {
        const bodyCmp = this.getComponent('fieldBody') as any;
        if (bodyCmp) bodyCmp.step = value;
    }

    _onShowValueOptionChange(value: boolean): void {
        const bodyCmp = this.getComponent('fieldBody') as any;
        if (bodyCmp) bodyCmp.showValue = value;
    }

    _onDisableOptionChange(value: boolean): void {
        const cls = `${this._cssPrefix}--disabled`;
        value ? this.addCls(cls) : this.removeCls(cls);
        const bodyCmp = this.getComponent('fieldBody') as any;
        if (bodyCmp) bodyCmp.disable = value;
    }

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-slider');
        const fieldBodyCmp = this.getComponent('fieldBody') as any;
        if (fieldBodyCmp) {
            fieldBodyCmp.on('sliderChange', (data: any) => {
                this.value = data.value;
                this.emit('slider:change', { value: data.value });
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
