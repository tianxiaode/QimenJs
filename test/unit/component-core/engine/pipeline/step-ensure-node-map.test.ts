jest.mock('@/component-core/engine/ComponentRegistrar', () => {
    const actual = jest.requireActual('@/component-core/engine/ComponentRegistrar');
    return {
        ...actual,
        TemplateRegistrar: actual.ComponentRegistrar,
    };
});

import { ensureNodeMap } from '@/component-core/engine/pipeline/step-ensure-node-map';
import { ComponentRegistrar } from '@/component-core/engine/ComponentRegistrar';

function resetSingleton(): void {
    const base = Object.getPrototypeOf(ComponentRegistrar);
    (base as any).instances = new Map();
}

describe('step-ensure-node-map', () => {
    it('ctor.type 为空时提前返回', () => {
        const ctx = {
            ctor: { type: '' },
            instance: {},
            nodeMapMgr: null,
        } as any;
        ensureNodeMap(ctx);
        expect(ctx.nodeMapMgr).toBeNull();
    });

    it('ctor.type 有值但未注册模板时提前返回', () => {
        resetSingleton();
        const ctx = {
            ctor: { type: 'Unregistered' },
            instance: {},
            nodeMapMgr: null,
        } as any;
        ensureNodeMap(ctx);
        expect(ctx.nodeMapMgr).toBeNull();
    });
});
