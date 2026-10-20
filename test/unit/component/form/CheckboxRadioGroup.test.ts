/**
 * 表单 clear 上移 + Checkbox 全选 + Radio 取消选中测试
 *
 * 覆盖：clear 分发由 FormFieldComponent 基类统一处理（onClearBtnClick 子类定制）、
 * CheckboxGroup 组头全选框三态联动（全选勾/半选 indeterminate/未选空）、
 * RadioGroup 点击已选项取消全部选择
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

import { InputComponent } from '@/component/form/InputComponent';
import { CheckboxGroupComponent } from '@/component/form/CheckboxGroupComponent';
import { RadioGroupComponent } from '@/component/form/RadioGroupComponent';
import { gestureClick } from '../../helpers/gesture';

describe('表单 clear/全选/取消选中', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = '';
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    const flush = async () => {
        for (let i = 0; i < 8; i++) await new Promise(resolve => setTimeout(resolve, 0));
    };

    const mount = async (inst: any) => {
        document.body.appendChild(inst.el!);
        await flush();
        return inst;
    };

    // ══════════════════════════════════════════════════════════════
    // clear 分发（基类统一处理）
    // ══════════════════════════════════════════════════════════════

    describe('InputComponent clear', () => {
        it('点击 clear 按钮应清空并派发 input', async () => {
            const inst = await mount(new InputComponent({ value: 'abc', clearable: true }));
            const events: any[] = [];
            inst.on('input', (ctx: any) => {
                events.push(ctx?.data?.value ?? ctx);
            });

            const clearBtn = inst['_clearBtnItem']?.el as HTMLElement;
            expect(clearBtn).toBeTruthy();

            gestureClick(clearBtn);

            expect(inst.value).toBe('');
            expect(events).toContain('');
        });

        it('value 为空时 clear 按钮隐藏', async () => {
            const inst = await mount(new InputComponent({ value: 'abc', clearable: true }));
            const clearBtn = inst['_clearBtnItem']?.el as HTMLElement;

            expect(clearBtn.classList.contains('hidden')).toBe(false);

            inst.value = '';
            expect(clearBtn.classList.contains('hidden')).toBe(true);
        });
    });

    // ══════════════════════════════════════════════════════════════
    // CheckboxGroup 全选/不选
    // ══════════════════════════════════════════════════════════════

    describe('CheckboxGroup selectAll', () => {
        const OPTS = [
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' },
            { label: 'C', value: 'c' },
        ];

        const mountGroup = async (extra: Record<string, any> = {}) =>
            (await mount(
                new CheckboxGroupComponent({ items: OPTS, selectAll: true, ...extra })
            )) as CheckboxGroupComponent;

        it('selectAll=false 不渲染全选框', async () => {
            const inst = await mount(new CheckboxGroupComponent({ items: OPTS }));
            expect(inst['_selectAllItem']).toBeNull();
        });

        it('点击全选框全选全部项，再点清空', async () => {
            const inst = await mountGroup();
            const events: any[] = [];
            inst.on('checkbox:change', (ctx: any) => {
                events.push(ctx?.data?.value ?? ctx);
            });

            const box = inst['_selectAllItem']!.el.querySelector('.q-checkbox') as HTMLElement;
            gestureClick(inst['_selectAllItem']!.el);

            expect(inst.value).toEqual(['a', 'b', 'c']);
            expect(box.classList.contains('q-checkbox--checked')).toBe(true);
            expect(events[0]).toEqual(['a', 'b', 'c']);

            gestureClick(inst['_selectAllItem']!.el);
            expect(inst.value).toEqual([]);
            expect(box.classList.contains('q-checkbox--checked')).toBe(false);
        });

        it('部分选中时全选框呈 indeterminate 半选态', async () => {
            const inst = await mountGroup({ value: ['a'] });
            const box = inst['_selectAllItem']!.el.querySelector('.q-checkbox') as HTMLElement;

            expect(box.classList.contains('q-checkbox--indeterminate')).toBe(true);
            expect(box.classList.contains('q-checkbox--checked')).toBe(false);
            expect(inst['_selectAllItem']!.el.getAttribute('aria-checked')).toBe('mixed');

            inst.value = ['a', 'b', 'c'];
            expect(box.classList.contains('q-checkbox--checked')).toBe(true);
            expect(box.classList.contains('q-checkbox--indeterminate')).toBe(false);
        });

        it('子项变化联动全选框状态', async () => {
            const inst = await mountGroup();
            const box = inst['_selectAllItem']!.el.querySelector('.q-checkbox') as HTMLElement;

            // 点击子项 a
            const itemA = inst['_checkboxItems'][0].item.el as HTMLElement;
            gestureClick(itemA);
            expect(inst.value).toEqual(['a']);
            expect(box.classList.contains('q-checkbox--indeterminate')).toBe(true);

            // 全选后点击子项 a → 只剩 b/c，回到半选
            gestureClick(inst['_selectAllItem']!.el);
            gestureClick(itemA);
            expect(inst.value).toEqual(['b', 'c']);
            expect(box.classList.contains('q-checkbox--indeterminate')).toBe(true);
        });
    });

    // ══════════════════════════════════════════════════════════════
    // RadioGroup 点击已选项取消
    // ══════════════════════════════════════════════════════════════

    describe('RadioGroup 取消选中', () => {
        const OPTS = [
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' },
        ];

        it('点击已选项应取消全部选择', async () => {
            const inst = (await mount(
                new RadioGroupComponent({ items: OPTS, value: 'a' })
            )) as RadioGroupComponent;
            const events: any[] = [];
            inst.on('radio:change', (ctx: any) => {
                events.push(ctx?.data ? ctx.data.value : ctx);
            });

            const itemA = inst['_radioItems'][0].item.el as HTMLElement;
            gestureClick(itemA);

            expect(inst.value).toBeNull();
            expect(events).toContain(null);

            // 取消后可重新选择
            gestureClick(itemA);
            expect(inst.value).toBe('a');
        });

        it('点击未选项正常切换', async () => {
            const inst = (await mount(
                new RadioGroupComponent({ items: OPTS, value: 'a' })
            )) as RadioGroupComponent;

            const itemB = inst['_radioItems'][1].item.el as HTMLElement;
            gestureClick(itemB);

            expect(inst.value).toBe('b');
        });
    });
});
