/**
 * NumberInput 步进回归测试
 *
 * 回归背景：clamp 对未设置的 min/max（null）用 `!== undefined` 判断，
 * `v > null` 强转为 `v > 0`，正值一律 return max（null）→ 步进静默失效、值变 null。
 * 修复：`!= null` 同时排除 null 与 undefined。
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

import { NumberInputComponent } from '@/component/form/NumberInputComponent';

describe('NumberInputComponent 步进', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    // 组件链有多级 setTimeout（createChildren → _continueInit → 子组件初始化），
    // 需多轮 flush 让整条异步初始化链完成
    const flush = async () => {
        for (let i = 0; i < 8; i++) await new Promise(resolve => setTimeout(resolve, 0));
    };

    const mount = async (options: Record<string, any>) => {
        const inst = new NumberInputComponent(options as any);
        document.body.appendChild(inst.el!);
        await flush();
        return inst;
    };

    const getUpBtn = (inst: NumberInputComponent) =>
        inst.el!.querySelector('.q-number-input__step-up') as HTMLButtonElement;
    const getDownBtn = (inst: NumberInputComponent) =>
        inst.el!.querySelector('.q-number-input__step-down') as HTMLButtonElement;
    const getFieldEl = (inst: NumberInputComponent) =>
        inst['_getFieldEl']() as HTMLInputElement;

    it('demo 场景（value=3.14, precision=2, step=0.01，无 min/max）：点击步进生效', async () => {
        const inst = await mount({ value: 3.14, precision: 2, step: 0.01, label: '精度2位' });

        const fieldEl = getFieldEl(inst);
        expect(fieldEl).toBeTruthy();
        expect(fieldEl.type).toBe('number');
        expect(fieldEl.value).toBe('3.14');

        getUpBtn(inst).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(inst.numValue).toBe(3.15);
        expect(fieldEl.value).toBe('3.15');

        getDownBtn(inst).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        getDownBtn(inst).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(inst.numValue).toBe(3.13);
        expect(fieldEl.value).toBe('3.13');
    });

    it('空值时步进从 min（未设则 0）起算', async () => {
        const inst = await mount({ placeholder: '数字', min: 0, max: 100, step: 1 });

        expect(inst.numValue).toBeNaN();

        getUpBtn(inst).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(inst.numValue).toBe(1);

        getDownBtn(inst).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        getDownBtn(inst).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(inst.numValue).toBe(0);
    });

    it('有 min/max 时按边界收敛', async () => {
        const inst = await mount({ value: 99, min: 0, max: 100, step: 10 });

        getUpBtn(inst).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        getUpBtn(inst).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(inst.numValue).toBe(100);

        getDownBtn(inst).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        getDownBtn(inst).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        getDownBtn(inst).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(inst.numValue).toBe(70);
    });

    it('controls=false 不挂步进按钮', async () => {
        const inst = await mount({ value: 10, controls: false });

        expect(inst.el!.querySelector('.q-number-input__steps')).toBeNull();
    });

    it('keydown 拦截非法字符，数字/符号放行', async () => {
        const inst = await mount({ value: 3.14, precision: 2, step: 0.01 });
        const fieldEl = getFieldEl(inst);

        const letter = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
        fieldEl.dispatchEvent(letter);
        expect(letter.defaultPrevented).toBe(true);

        const digit = new KeyboardEvent('keydown', { key: '7', bubbles: true, cancelable: true });
        fieldEl.dispatchEvent(digit);
        expect(digit.defaultPrevented).toBe(false);

        const dot = new KeyboardEvent('keydown', { key: '.', bubbles: true, cancelable: true });
        fieldEl.dispatchEvent(dot);
        expect(dot.defaultPrevented).toBe(false);

        const backspace = new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true });
        fieldEl.dispatchEvent(backspace);
        expect(backspace.defaultPrevented).toBe(false);
    });

    it('input 兜底清理非法字符（粘贴/输入法）并保留数字', async () => {
        const inst = await mount({ value: 3.14, precision: 2, step: 0.01 });
        const fieldEl = getFieldEl(inst);

        // type=number 下浏览器/jsdom 直接吞非法值（原生防线），改 type=text 模拟未生效环境测兜底
        fieldEl.setAttribute('type', 'text');
        fieldEl.value = '12ab34';
        fieldEl.dispatchEvent(new Event('input', { bubbles: true }));
        expect(fieldEl.value).toBe('1234');
        expect(inst.numValue).toBe(1234);
        expect(inst.value).toBe('1234');
    });
});
