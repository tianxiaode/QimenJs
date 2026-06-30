/**
 * DescriptorFactory 单元测试
 */

import { DescriptorFactory } from '@/composable/DescriptorFactory';

describe('DescriptorFactory', () => {
    describe('getter', () => {
        it('should create getter descriptor', () => {
            const host = { value: 42 };
            const factory = DescriptorFactory.getter((h: any) => h.value);
            const descriptor = factory(host);
            expect(descriptor.get).toBeDefined();
            expect((descriptor as any).get()).toBe(42);
            expect(descriptor.configurable).toBe(true);
            expect(descriptor.enumerable).toBe(true);
        });
    });

    describe('setter', () => {
        it('should create setter descriptor', () => {
            const host = { value: 0 };
            const factory = DescriptorFactory.setter((h: any, v: number) => { h.value = v; });
            const descriptor = factory(host);
            expect(descriptor.set).toBeDefined();
            (descriptor as any).set(100);
            expect(host.value).toBe(100);
        });
    });

    describe('accessor', () => {
        it('should create accessor with getter and setter', () => {
            const host = { value: 42 };
            const factory = DescriptorFactory.accessor(
                (h: any) => h.value,
                (h: any, v: number) => { h.value = v; }
            );
            const descriptor = factory(host);
            expect((descriptor as any).get()).toBe(42);
            (descriptor as any).set(100);
            expect(host.value).toBe(100);
        });

        it('should create accessor without setter', () => {
            const host = { value: 42 };
            const factory = DescriptorFactory.accessor((h: any) => h.value);
            const descriptor = factory(host);
            expect((descriptor as any).get()).toBe(42);
            expect(descriptor.set).toBeUndefined();
        });
    });

    describe('method', () => {
        it('should create method descriptor', () => {
            const host = { calls: 0 };
            const factory = DescriptorFactory.method((h: any, x: number) => { h.calls += x; });
            const descriptor = factory(host);
            expect(descriptor.value).toBeDefined();
            (descriptor as any).value(5);
            expect(host.calls).toBe(5);
        });
    });

    describe('value', () => {
        it('should create value descriptor', () => {
            const factory = DescriptorFactory.value(42);
            const descriptor = factory({});
            expect(descriptor.value).toBe(42);
            expect(descriptor.writable).toBe(true);
        });
    });

    describe('dynamicValue', () => {
        it('should create dynamic value descriptor', () => {
            const factory = DescriptorFactory.dynamicValue((h: any) => h.multiplier * 10);
            const descriptor = factory({ multiplier: 5 });
            expect(descriptor.value).toBe(50);
        });
    });

    describe('readonlyValue', () => {
        it('should create readonly value descriptor', () => {
            const factory = DescriptorFactory.readonlyValue('constant');
            const descriptor = factory({});
            expect(descriptor.value).toBe('constant');
            expect(descriptor.writable).toBe(false);
        });
    });

    describe('computed', () => {
        it('should create computed descriptor with caching', () => {
            let callCount = 0;
            const factory = DescriptorFactory.computed((h: any) => {
                callCount++;
                return h.data * 2;
            });
            const host = { data: 21 };
            const descriptor = factory(host);

            // First access: compute
            expect((descriptor as any).get()).toBe(42);
            expect(callCount).toBe(1);

            // Second access: cached
            expect((descriptor as any).get()).toBe(42);
            expect(callCount).toBe(1);
        });
    });
});
