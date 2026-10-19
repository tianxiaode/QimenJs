/**
 * Switch/Slider fieldBody 迁移单元测试
 *
 * 覆盖：fieldBody 统一为 Container + 专用 field-body 子项、
 * Switch 点击切换（domEvents 委托修复 switchToggle 无源 bug）、
 * Slider 属性透传与 sliderChange 事件回流、表单值读写
 */

jest.mock('@/logger', () => {
    const actualLogger = jest.requireActual('@/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            })),
        },
    };
});

jest.mock('@qimenjs/task', () => ({
    globalTaskQueue: {
        addTask: jest.fn((fn: () => any) => fn()),
    },
}));

import { SwitchComponent } from '@/component/form/SwitchComponent';
import { SliderComponent } from '@/component/form/SliderComponent';
import { ContainerComponent } from '@/component/container/ContainerComponent';
import { SwitchFieldBodyComponent } from '@/component/form/SwitchFieldBodyComponent';
import { SliderFieldBodyComponent } from '@/component/form/SliderFieldBodyComponent';

describe('Switch/Slider fieldBody 迁移', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = '';
    });

    // 组件链有多级 setTimeout（父 _continueInit → 子 createChildren → 子 _continueInit），
    // 需多轮 flush 让整条异步初始化链完成
    const flush = async () => {
        for (let i = 0; i < 5; i++) await new Promise(resolve => setTimeout(resolve, 0));
    };

    // ══════════════════════════════════════════════════════════════
    // Switch
    // ══════════════════════════════════════════════════════════════

    describe('SwitchComponent', () => {
        let instance: SwitchComponent;

        beforeEach(async () => {
            instance = new SwitchComponent();
            document.body.appendChild(instance.el!);
            await flush();
        });

        afterEach(() => {
            instance.dispose();
        });

        it('fieldBody 应为 Container 且包含 SwitchFieldBody 子项', () => {
            const fieldBody = instance.getComponent('fieldBody');
            expect(fieldBody).toBeInstanceOf(ContainerComponent);
            expect(instance['_fieldItem']).toBeInstanceOf(SwitchFieldBodyComponent);
        });

        it('点击 fieldBody 应切换 checked 并派发 switch:change', () => {
            const events: any[] = [];
            instance.on('switch:change', (ctx: any) => events.push(ctx?.data?.checked ?? ctx));

            const fieldBody = instance.getComponent('fieldBody') as ContainerComponent;
            fieldBody.el!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            expect(instance.checked).toBe(true);
            expect(events).toContain(true);

            fieldBody.el!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            expect(instance.checked).toBe(false);
        });

        it('disable 状态下点击不应切换', () => {
            instance.disable = true;

            const fieldBody = instance.getComponent('fieldBody') as ContainerComponent;
            fieldBody.el!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            expect(instance.checked).toBe(false);
        });

        it('checked 变化应同步 track 的 aria 与 checked 类', () => {
            instance.checked = true;

            expect(instance.el!.classList.contains('q-switch--checked')).toBe(true);
            const trackEl = (instance as any)._getTrackEl();
            expect(trackEl?.getAttribute('aria-checked')).toBe('true');
            expect(trackEl?.getAttribute('role')).toBe('switch');
        });

        it('activeText/inactiveText 应反映到 track 的 data-text', () => {
            instance.activeText = '开';
            instance.inactiveText = '关';

            const trackEl = (instance as any)._getTrackEl() as HTMLElement;
            expect(trackEl.getAttribute('data-text')).toBe('关');

            instance.checked = true;
            expect(trackEl.getAttribute('data-text')).toBe('开');
        });

        it('getFormValue/setFormValue/formReset 应读写 checked', () => {
            instance.setFormValue(true);
            expect(instance.getFormValue()).toBe(true);

            instance.formReset();
            expect(instance.getFormValue()).toBe(false);

            instance.formReset(true);
            expect(instance.getFormValue()).toBe(true);
        });
    });

    // ══════════════════════════════════════════════════════════════
    // Slider
    // ══════════════════════════════════════════════════════════════

    describe('SliderComponent', () => {
        let instance: SliderComponent;

        beforeEach(async () => {
            instance = new SliderComponent({ value: 50, min: 0, max: 100 });
            document.body.appendChild(instance.el!);
            await flush();
        });

        afterEach(() => {
            instance.dispose();
        });

        it('fieldBody 应为 Container 且包含 SliderFieldBody 子项', () => {
            const fieldBody = instance.getComponent('fieldBody');
            expect(fieldBody).toBeInstanceOf(ContainerComponent);
            expect(instance['_fieldItem']).toBeInstanceOf(SliderFieldBodyComponent);
        });

        it('value/min/max/step 应透传到 SliderFieldBody 子项', () => {
            const bodyItem = instance['_fieldItem'] as any;
            expect(bodyItem.value).toBe(50);
            expect(bodyItem.min).toBe(0);
            expect(bodyItem.max).toBe(100);

            instance.value = 75;
            instance.step = 5;
            expect(bodyItem.value).toBe(75);
            expect(bodyItem.step).toBe(5);
        });

        it('sliderChange 事件应回流到 value 与 slider:change', () => {
            const events: any[] = [];
            instance.on('slider:change', (ctx: any) => events.push(ctx?.data?.value ?? ctx));

            const bodyItem = instance['_fieldItem'] as any;
            bodyItem.emit('sliderChange', { value: 80 });

            expect(instance.value).toBe(80);
            expect(events).toContain(80);
        });

        it('showValue 应透传控制值标签显隐', () => {
            const bodyItem = instance['_fieldItem'] as any;
            const labelEl = bodyItem.getNodeEl('valueLabel') as HTMLElement;

            expect(labelEl.hidden).toBe(false);
            instance.showValue = false;
            expect(labelEl.hidden).toBe(true);
        });

        it('disable 应透传到子项', () => {
            instance.disable = true;
            expect((instance['_fieldItem'] as any).disable).toBe(true);
        });

        it('getFormValue/setFormValue 应读写数值', () => {
            instance.setFormValue('42');
            expect(instance.getFormValue()).toBe(42);
        });
    });
});
