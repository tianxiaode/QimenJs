/**
 * ComponentManager 单元测试
 */

import { ComponentManager, getCmp } from '@/component-core/ComponentManager';
import { TemplateComponent } from '@/component-core';

const TPL = '<div class="box"></div>';

describe('ComponentManager', () => {
    let mgr: ComponentManager;

    beforeEach(() => {
        mgr = ComponentManager.getInstance();
    });

    it('register + get by cid', () => {
        const BoxClass = TemplateComponent.withTemplate(TPL).with([]);
        const instance = new BoxClass() as any;
        mgr.register(instance);
        expect(mgr.get(instance.cid)).toBe(instance);
    });

    it('register + get by id', () => {
        const BoxClass = TemplateComponent.withTemplate(TPL).with([]);
        const instance = new BoxClass() as any;
        instance.id = 'test-mgr-001';
        mgr.register(instance);
        expect(mgr.get('test-mgr-001')).toBe(instance);
    });

    it('unregister', () => {
        const BoxClass = TemplateComponent.withTemplate(TPL).with([]);
        const instance = new BoxClass() as any;
        mgr.register(instance);
        mgr.unregister(instance);
        expect(mgr.get(instance.cid)).toBeUndefined();
    });

    it('unregister with id', () => {
        const BoxClass = TemplateComponent.withTemplate(TPL).with([]);
        const instance = new BoxClass() as any;
        instance.id = 'test-mgr-002';
        mgr.register(instance);
        mgr.unregister(instance);
        expect(mgr.get('test-mgr-002')).toBeUndefined();
    });

    it('get 不存在的 id → undefined', () => {
        expect(mgr.get('nonexistent')).toBeUndefined();
    });

    it('getAll 返回所有实例', () => {
        const BoxClass = TemplateComponent.withTemplate(TPL).with([]);
        const instance = new BoxClass() as any;
        mgr.register(instance);
        expect(mgr.getAll()).toContainEqual(instance);
    });

    it('size 返回实例数', () => {
        const size = mgr.size;
        expect(typeof size).toBe('number');
        expect(size).toBeGreaterThanOrEqual(0);
    });

    it('getCmp 便捷方法', () => {
        const BoxClass = TemplateComponent.withTemplate(TPL).with([]);
        const instance = new BoxClass() as any;
        instance.id = 'test-getcmp-001';
        mgr.register(instance);
        expect(getCmp('test-getcmp-001')).toBe(instance);
    });
});
