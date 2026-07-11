/**
 * ComponentRegistrar 单元测试
 */

import { ComponentRegistrar } from '@/component-core/ComponentRegistrar';
import { TemplateComponent } from '@/component-core';

const TPL = '<div class="box"></div>';

describe('ComponentRegistrar', () => {
    let registrar: ComponentRegistrar;

    beforeEach(() => {
        registrar = ComponentRegistrar.getInstance();
    });

    afterEach(() => {
        // 清理测试注册
        try { registrar.unregister('TestButton'); } catch {}
        try { registrar.unregister('TestInput'); } catch {}
    });

    describe('register / get', () => {
        it('通过 ComponentDefinition 注册', () => {
            const BtnClass = TemplateComponent.withTemplate(TPL).with([]);
            registrar.register({ type: 'TestButton', component: BtnClass as any });
            expect(registrar.get('TestButton')).toBe(BtnClass);
        });

        it('通过 type + component 注册', () => {
            const InputClass = TemplateComponent.withTemplate(TPL).with([]);
            registrar.register('TestInput', InputClass as any);
            expect(registrar.get('TestInput')).toBe(InputClass);
        });

        it('未注册的 type → 返回 undefined', () => {
            expect(registrar.get('NonExistent')).toBeUndefined();
        });
    });

    describe('unregister', () => {
        it('注销后 get 返回 undefined', () => {
            const BtnClass = TemplateComponent.withTemplate(TPL).with([]);
            registrar.register('TestButton', BtnClass as any);
            expect(registrar.get('TestButton')).toBe(BtnClass);
            registrar.unregister('TestButton');
            expect(registrar.get('TestButton')).toBeUndefined();
        });
    });

    describe('has', () => {
        it('已注册 → true', () => {
            const BtnClass = TemplateComponent.withTemplate(TPL).with([]);
            registrar.register('TestButton', BtnClass as any);
            expect(registrar.has('TestButton')).toBe(true);
        });

        it('未注册 → false', () => {
            expect(registrar.has('NonExistent')).toBe(false);
        });
    });

    describe('getDefinition', () => {
        it('返回完整定义', () => {
            const BtnClass = TemplateComponent.withTemplate(TPL).with([]);
            registrar.register({ type: 'TestButton', component: BtnClass as any });
            const def = registrar.getDefinition('TestButton');
            expect(def).toBeDefined();
            expect(def!.type).toBe('TestButton');
            expect(def!.component).toBe(BtnClass);
        });

        it('未注册 → undefined', () => {
            expect(registrar.getDefinition('NonExistent')).toBeUndefined();
        });
    });

    describe('getAll', () => {
        it('返回所有注册定义', () => {
            const BtnClass = TemplateComponent.withTemplate(TPL).with([]);
            const InputClass = TemplateComponent.withTemplate(TPL).with([]);
            registrar.register('TestButton', BtnClass as any);
            registrar.register('TestInput', InputClass as any);
            const all = registrar.getAll();
            expect(all.length).toBeGreaterThanOrEqual(2);
        });
    });
});
