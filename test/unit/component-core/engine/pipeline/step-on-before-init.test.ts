import { onBeforeInit } from '@/component-core/engine/pipeline/step-on-before-init';

describe('step-on-before-init', () => {
    it('调用 instance.onBeforeInit', () => {
        const onBeforeInitFn = jest.fn();
        const ctx = {
            instance: { onBeforeInit: onBeforeInitFn },
            props: { id: 'test' },
        } as any;
        onBeforeInit(ctx);
        expect(onBeforeInitFn).toHaveBeenCalledWith(ctx.props);
    });

    it('instance 无 onBeforeInit 方法时不报错', () => {
        const ctx = {
            instance: {},
            props: {},
        } as any;
        expect(() => onBeforeInit(ctx)).not.toThrow();
    });
});
