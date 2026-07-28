jest.mock('@qimenjs/task', () => ({
    globalTaskQueue: {
        addTask: jest.fn((fn: () => any) => fn()),
    },
}));

import { instantiateChildComponents } from '@/component-core/engine/pipeline/step-instantiate-child-components';

describe('step-instantiate-child-components', () => {
    it('nodeMapMgr 为 null 时提前返回', async () => {
        const ctx = {
            instance: {},
            nodeMapMgr: null,
        } as any;
        await expect(instantiateChildComponents(ctx)).resolves.toBeUndefined();
    });

    it('无子组件时提前返回', async () => {
        const ctx = {
            instance: {},
            nodeMapMgr: { nodeMetas: { root: { tag: 'div' } } },
        } as any;
        await expect(instantiateChildComponents(ctx)).resolves.toBeUndefined();
    });

    it('有子组件时实例化', async () => {
        const ChildClass = jest.fn();
        const ctx = {
            instance: { props: { body: { text: 'hi' } } },
            nodeMapMgr: {
                nodeMetas: {
                    body: { componentClass: ChildClass },
                },
            },
        } as any;
        await instantiateChildComponents(ctx);
        expect(ChildClass).toHaveBeenCalledWith(
            expect.objectContaining({
                parent: ctx.instance,
                slotName: 'body',
                text: 'hi',
            })
        );
    });

    it('子组件实例化失败时抛出错误', async () => {
        const ChildClass = jest.fn().mockImplementation(() => {
            throw new Error('init failed');
        });
        const ctx = {
            instance: { props: {} },
            nodeMapMgr: {
                nodeMetas: {
                    body: { componentClass: ChildClass },
                },
            },
        } as any;
        await expect(instantiateChildComponents(ctx)).rejects.toThrow('init failed');
    });
});
