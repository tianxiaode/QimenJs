import { initFloats } from '@/component-core/engine/pipeline/step-init-floats';
import { OVERLAY_ACTIONS } from '@/events/overlay-events';
import type { InitContext } from '@/component-core/types/init-context';

describe('step-init-floats', () => {
    function createCtx(instanceOverrides: Record<string, any> = {}): InitContext {
        const instance = {
            id: '',
            props: {},
            el: document.createElement('div'),
            overlayEmit: jest.fn(),
            constructor: {},
            ...instanceOverrides,
        };
        return {
            instance,
            props: {},
            ctor: instance.constructor,
            nodeMapMgr: null,
            debug: false,
            steps: [],
        } as InitContext;
    }

    it('无 floats 时不发送事件', () => {
        const ctx = createCtx();
        initFloats(ctx);
        expect(ctx.instance.overlayEmit).not.toHaveBeenCalled();
    });

    it('有 floats 时发送 INIT 事件', () => {
        const floats = {
            badge: { type: 'Badge', trigger: 'always' },
            tooltip: { type: 'Tooltip', trigger: 'hover' },
        };
        const ctx = createCtx({
            constructor: { floats },
        });

        initFloats(ctx);

        expect(ctx.instance.overlayEmit).toHaveBeenCalledTimes(1);
        const emitted = ctx.instance.overlayEmit.mock.calls[0][0];
        expect(emitted.type).toBe(OVERLAY_ACTIONS.INIT);
        expect(emitted.data.floats).toBe(floats);
        expect(emitted.data.component).toBe(ctx.instance);
    });

    it('id 未赋值时自动生成', () => {
        const floats = { badge: { type: 'Badge', trigger: 'always' } };
        const ctx = createCtx({
            id: '',
            constructor: { floats },
        });

        initFloats(ctx);

        expect(ctx.instance.id).toBeTruthy();
        const emitted = ctx.instance.overlayEmit.mock.calls[0][0];
        expect(emitted.source).toBe(ctx.instance.id);
    });

    it('id 已有时不覆盖', () => {
        const floats = { badge: { type: 'Badge', trigger: 'always' } };
        const ctx = createCtx({
            id: 'my-btn',
            constructor: { floats },
        });

        initFloats(ctx);

        expect(ctx.instance.id).toBe('my-btn');
        const emitted = ctx.instance.overlayEmit.mock.calls[0][0];
        expect(emitted.source).toBe('my-btn');
    });

    it('优先从 constructor.floats 读取', () => {
        const staticFloats = { badge: { type: 'Badge' } };
        const instanceFloats = { tooltip: { type: 'Tooltip' } };
        const ctx = createCtx({
            floats: instanceFloats,
            constructor: { floats: staticFloats },
        });

        initFloats(ctx);

        const emitted = ctx.instance.overlayEmit.mock.calls[0][0];
        expect(emitted.data.floats).toBe(staticFloats);
    });

    it('constructor 无 floats 时回退到 instance.floats', () => {
        const instanceFloats = { badge: { type: 'Badge' } };
        const ctx = createCtx({
            floats: instanceFloats,
            constructor: {},
        });

        initFloats(ctx);

        const emitted = ctx.instance.overlayEmit.mock.calls[0][0];
        expect(emitted.data.floats).toBe(instanceFloats);
    });

    it('从 props.id 取 id', () => {
        const floats = { badge: { type: 'Badge' } };
        const ctx = createCtx({
            id: '',
            props: { id: 'prop-id' },
            constructor: { floats },
        });

        initFloats(ctx);

        expect(ctx.instance.id).toBe('prop-id');
    });
});
