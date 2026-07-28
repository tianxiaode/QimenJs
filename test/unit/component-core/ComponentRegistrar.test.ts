/**
 * ComponentRegistrar 单元测试
 */

import { ComponentRegistrar } from '@/component-core/ComponentRegistrar';
import type { ComponentMeta } from '@/component-core/ComponentRegistrar';

describe('ComponentRegistrar', () => {
    let registrar: ComponentRegistrar;

    beforeEach(() => {
        // 清空注册表
        registrar = ComponentRegistrar.getInstance();
        registrar.clear();
    });

    describe('getInstance', () => {
        it('返回单例实例', () => {
            const instance1 = ComponentRegistrar.getInstance();
            const instance2 = ComponentRegistrar.getInstance();
            expect(instance1).toBe(instance2);
        });
    });

    describe('registerMeta', () => {
        it('注册组件元数据', () => {
            const meta: ComponentMeta = {
                defaultEventData: ['label', 'value'],
            };
            registrar.registerMeta('Button', meta);
            expect(registrar.has('Button')).toBe(true);
        });

        it('覆盖已存在的组件元数据', () => {
            const meta1: ComponentMeta = { defaultEventData: ['label'] };
            const meta2: ComponentMeta = { defaultEventData: ['label', 'value'] };

            registrar.registerMeta('Button', meta1);
            registrar.registerMeta('Button', meta2);

            const result = registrar.getMeta('Button');
            expect(result?.defaultEventData).toEqual(['label', 'value']);
        });

        it('注册包含自定义字段的元数据', () => {
            const meta: ComponentMeta = {
                defaultEventData: ['id'],
                customField: 'customValue',
                nested: { key: 'value' },
            };
            registrar.registerMeta('MyComponent', meta);
            const result = registrar.getMeta('MyComponent');
            expect(result?.customField).toBe('customValue');
            expect(result?.nested).toEqual({ key: 'value' });
        });
    });

    describe('getMeta', () => {
        it('获取已注册的组件元数据', () => {
            const meta: ComponentMeta = {
                defaultEventData: ['label', 'value'],
            };
            registrar.registerMeta('Button', meta);
            const result = registrar.getMeta('Button');
            expect(result).toEqual(meta);
        });

        it('未注册的组件返回 undefined', () => {
            const result = registrar.getMeta('NonExistent');
            expect(result).toBeUndefined();
        });
    });

    describe('has', () => {
        it('已注册的组件返回 true', () => {
            registrar.registerMeta('Button', { defaultEventData: [] });
            expect(registrar.has('Button')).toBe(true);
        });

        it('未注册的组件返回 false', () => {
            expect(registrar.has('NonExistent')).toBe(false);
        });
    });

    describe('unregister', () => {
        it('注销已注册的组件', () => {
            registrar.registerMeta('Button', { defaultEventData: [] });
            expect(registrar.has('Button')).toBe(true);

            registrar.unregister('Button');
            expect(registrar.has('Button')).toBe(false);
        });

        it('注销未注册的组件不抛出错误', () => {
            expect(() => registrar.unregister('NonExistent')).not.toThrow();
        });
    });

    describe('names', () => {
        it('返回所有已注册的组件名称', () => {
            registrar.registerMeta('Button', {});
            registrar.registerMeta('Input', {});
            registrar.registerMeta('Select', {});

            const names = registrar.names();
            expect(names).toHaveLength(3);
            expect(names).toContain('Button');
            expect(names).toContain('Input');
            expect(names).toContain('Select');
        });

        it('空注册表返回空数组', () => {
            const names = registrar.names();
            expect(names).toEqual([]);
        });
    });

    describe('clear', () => {
        it('清空所有注册的组件', () => {
            registrar.registerMeta('Button', {});
            registrar.registerMeta('Input', {});
            expect(registrar.names()).toHaveLength(2);

            registrar.clear();
            expect(registrar.names()).toHaveLength(0);
        });
    });

    describe('doInspect', () => {
        it('返回注册表信息', () => {
            registrar.registerMeta('Button', { defaultEventData: ['label'] });
            registrar.registerMeta('Input', { defaultEventData: ['value'] });

            // 验证 doInspect 方法被正确实现
            expect(registrar.has('Button')).toBe(true);
            expect(registrar.has('Input')).toBe(true);
            expect(registrar.names()).toHaveLength(2);
        });
    });

    describe('集成场景', () => {
        it('完整的注册和查询流程', () => {
            // 注册多个组件
            registrar.registerMeta('Button', {
                defaultEventData: ['label', 'disabled'],
            });
            registrar.registerMeta('Input', {
                defaultEventData: ['value', 'placeholder'],
            });

            // 验证注册结果
            expect(registrar.has('Button')).toBe(true);
            expect(registrar.has('Input')).toBe(true);
            expect(registrar.names()).toHaveLength(2);

            // 获取元数据
            const buttonMeta = registrar.getMeta('Button');
            expect(buttonMeta?.defaultEventData).toEqual(['label', 'disabled']);

            // 注销组件
            registrar.unregister('Button');
            expect(registrar.has('Button')).toBe(false);
            expect(registrar.names()).toHaveLength(1);

            // 清空
            registrar.clear();
            expect(registrar.names()).toHaveLength(0);
        });
    });
});