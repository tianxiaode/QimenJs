import { selfMount } from '@/component-core/engine/pipeline/step-self-mount';

describe('step-self-mount', () => {
    it('nodeMapMgr 为 null 时提前返回', () => {
        const ctx = {
            instance: { parent: {} },
            nodeMapMgr: null,
        } as any;
        expect(() => selfMount(ctx)).not.toThrow();
    });

    it('instance 无 parent 时提前返回', () => {
        const ctx = {
            instance: {},
            nodeMapMgr: {},
        } as any;
        expect(() => selfMount(ctx)).not.toThrow();
    });

    it('slotName 为空时提前返回', () => {
        const ctx = {
            instance: { parent: {}, slotName: '' },
            nodeMapMgr: {},
        } as any;
        expect(() => selfMount(ctx)).not.toThrow();
    });

    it('parent 无 nodeMapMgr 时提前返回', () => {
        const ctx = {
            instance: { parent: {}, slotName: 'body' },
            nodeMapMgr: {},
        } as any;
        expect(() => selfMount(ctx)).not.toThrow();
    });

    it('parentNodeMapMgr.get 返回 null 时提前返回', () => {
        const parentNodeMapMgr = { get: jest.fn().mockReturnValue(null) };
        const ctx = {
            instance: { parent: { nodeMapMgr: parentNodeMapMgr }, slotName: 'body' },
            nodeMapMgr: {},
        } as any;
        selfMount(ctx);
        expect(parentNodeMapMgr.get).toHaveBeenCalledWith('body');
    });

    it('正常挂载时调用 mountChildComponent', () => {
        const node = { el: document.createElement('div') };
        const parentNodeMapMgr = {
            get: jest.fn().mockReturnValue(node),
            mountChildComponent: jest.fn(),
        };
        const instance = { parent: { nodeMapMgr: parentNodeMapMgr }, slotName: 'body' };
        const ctx = {
            instance,
            nodeMapMgr: {},
        } as any;
        selfMount(ctx);
        expect(parentNodeMapMgr.mountChildComponent).toHaveBeenCalledWith(node, instance);
    });
});
