jest.mock('@/component-core/engine/ChildNodePropsEngine', () => ({
    ChildNodePropsEngine: {
        apply: jest.fn(),
    },
}));

import { setupNodeProps } from '@/component-core/engine/pipeline/step-setup-node-props';
import { ChildNodePropsEngine } from '@/component-core/engine/ChildNodePropsEngine';

describe('step-setup-node-props', () => {
    it('nodeMapMgr 为 null 时提前返回', () => {
        const ctx = {
            ctor: {},
            nodeMapMgr: null,
        } as any;
        expect(() => setupNodeProps(ctx)).not.toThrow();
    });

    it('ctor._nodePropsSetup 为 true 时跳过', () => {
        const nodeMapMgr = { nodeMetas: {}, i18nNodes: {} };
        const ctx = {
            ctor: { _nodePropsSetup: true },
            nodeMapMgr,
        } as any;
        setupNodeProps(ctx);
        expect(ChildNodePropsEngine.apply).not.toHaveBeenCalled();
    });

    it('正常执行时调用 ChildNodePropsEngine.apply', () => {
        const nodeMapMgr = { nodeMetas: { root: {} }, i18nNodes: {} };
        const ctx = {
            ctor: {},
            nodeMapMgr,
        } as any;
        setupNodeProps(ctx);
        expect(ChildNodePropsEngine.apply).toHaveBeenCalledWith(
            ctx.ctor,
            nodeMapMgr.nodeMetas,
            nodeMapMgr.i18nNodes
        );
        expect(ctx.ctor._nodePropsSetup).toBe(true);
    });
});
