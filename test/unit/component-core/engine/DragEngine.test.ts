jest.mock('@/logger', () => {
    const actualLogger = jest.requireActual('@/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            })),
        },
    };
});

import { DragEngine } from '@/component-core/engine/DragEngine';
import { DRAG_ACTIONS } from '@/events';

describe('DragEngine', () => {
    const engine = DragEngine.getInstance();

    function createMockInstance(initialCache: Record<string, any> = {}) {
        let cache = { ...initialCache };
        const instance: any = {
            id: 'comp-1',
            props: {},
            _initializing: false,
            abilityState: jest.fn(() => cache),
            setAbilityState: jest.fn((_key: string, val: any) => {
                cache = val;
            }),
            dragEmit: jest.fn(),
            get drags() {
                return engine.getDrags(instance);
            },
            set drags(val: any) {
                engine.setDrags(instance, val);
            },
        };
        return {
            instance,
            getCache: () => cache,
            getDragEmit: () => instance.dragEmit,
        };
    }

    describe('getInstance', () => {
        it('returns singleton', () => {
            const a = DragEngine.getInstance();
            const b = DragEngine.getInstance();
            expect(a).toBe(b);
        });
    });

    describe('缓存管理', () => {
        it('getCache / setCache', () => {
            const { instance, getCache } = createMockInstance();
            engine.setCache(instance, { body: { axis: 'x' } } as any);
            expect(getCache()).toEqual({ body: { axis: 'x' } });
        });

        it('getDrags 空缓存返回 undefined', () => {
            const { instance } = createMockInstance();
            expect(engine.getDrags(instance)).toBeUndefined();
        });

        it('getDrags 有缓存返回配置', () => {
            const { instance } = createMockInstance();
            engine.setCache(instance, { body: { axis: 'x' } } as any);
            expect(engine.getDrags(instance)).toEqual({ body: { axis: 'x' } });
        });

        it('setDrags 初始化阶段合并缓存', () => {
            const { instance, getCache } = createMockInstance({
                existing: { axis: 'y' },
            });
            instance._initializing = true;

            engine.setDrags(instance, { body: { axis: 'x' } } as any);

            expect(getCache().existing).toBeDefined();
            expect(getCache().body).toBeDefined();
        });

        it('setDrags 运行时触发 syncDrags', () => {
            const { instance, getCache, getDragEmit } = createMockInstance({
                body: { axis: 'x' },
            });
            instance._initializing = false;

            engine.setDrags(instance, { header: { axis: 'y' } } as any);

            expect(getCache().body).toBeUndefined();
            expect(getCache().header).toBeDefined();
            expect(getDragEmit()).toHaveBeenCalled();
        });
    });

    describe('syncDrags', () => {
        it('新增 key 时发送 INIT', () => {
            const { instance, getDragEmit } = createMockInstance();

            engine.syncDrags(instance, {}, { body: { axis: 'x' } } as any);

            const emits = getDragEmit();
            expect(emits).toHaveBeenCalledTimes(1);
            const ctx = emits.mock.calls[0][0];
            expect(ctx.type).toBe(DRAG_ACTIONS.INIT);
        });

        it('移除 key 时发送 DISPOSE', () => {
            const { instance, getDragEmit } = createMockInstance();

            engine.syncDrags(instance, { body: { axis: 'x' } } as any, {});

            const emits = getDragEmit();
            expect(emits).toHaveBeenCalledTimes(1);
            const ctx = emits.mock.calls[0][0];
            expect(ctx.type).toBe(DRAG_ACTIONS.DISPOSE);
        });

        it('key 变更时先 DISPOSE 再 INIT', () => {
            const { instance, getDragEmit } = createMockInstance();

            engine.syncDrags(
                instance,
                { body: { axis: 'x' } } as any,
                { body: { axis: 'y' } } as any
            );

            const emits = getDragEmit();
            expect(emits).toHaveBeenCalledTimes(2);
            expect(emits.mock.calls[0][0].type).toBe(DRAG_ACTIONS.DISPOSE);
            expect(emits.mock.calls[1][0].type).toBe(DRAG_ACTIONS.INIT);
        });

        it('key 未变更时不发送', () => {
            const { instance, getDragEmit } = createMockInstance();
            const decl = { axis: 'x' };

            engine.syncDrags(instance, { body: decl } as any, { body: decl } as any);

            expect(getDragEmit()).not.toHaveBeenCalled();
        });
    });

    describe('emitDragInit', () => {
        it('发送 INIT 事件', () => {
            const { instance, getDragEmit } = createMockInstance();

            engine.emitDragInit(instance, 'body', { axis: 'x' } as any);

            const ctx = getDragEmit().mock.calls[0][0];
            expect(ctx.type).toBe(DRAG_ACTIONS.INIT);
        });
    });

    describe('emitDragAction', () => {
        it('发送指定 action 事件', () => {
            const { instance, getDragEmit } = createMockInstance();

            engine.emitDragAction(instance, 'body', DRAG_ACTIONS.START);

            const ctx = getDragEmit().mock.calls[0][0];
            expect(ctx.type).toBe(DRAG_ACTIONS.START);
        });
    });

    describe('commitDrags', () => {
        it('有缓存时直接 diff 提交', () => {
            const { instance, getDragEmit } = createMockInstance({
                body: { axis: 'x' },
            });

            engine.commitDrags(instance);

            expect(getDragEmit()).toHaveBeenCalledTimes(1);
        });

        it('空缓存时不调用 dragEmit', () => {
            const { instance, getDragEmit } = createMockInstance();

            engine.commitDrags(instance);

            expect(getDragEmit()).not.toHaveBeenCalled();
        });

        it('drag=false 禁用所有拖拽', () => {
            const { instance, getDragEmit } = createMockInstance({
                body: { axis: 'x' },
            });
            instance.drag = false;

            engine.commitDrags(instance);

            expect(getDragEmit()).toHaveBeenCalled();
        });

        it('drag=true 使用 dragHandle', () => {
            const { instance, getDragEmit } = createMockInstance();
            instance.drag = true;
            instance.dragHandle = 'header';
            instance.nodeMap = { header: { el: document.createElement('div') } };

            engine.commitDrags(instance);

            expect(getDragEmit()).toHaveBeenCalled();
        });

        it('drag=true 无 dragHandle 使用模板 drag 节点', () => {
            const { instance, getDragEmit } = createMockInstance();
            instance.drag = true;
            instance.nodeMap = {
                body: { el: document.createElement('div'), drag: true },
            };

            engine.commitDrags(instance);

            expect(getDragEmit()).toHaveBeenCalled();
        });

        it('drag=true 无模板 drag 节点默认 self', () => {
            const { instance, getDragEmit } = createMockInstance();
            instance.drag = true;
            instance.nodeMap = {};

            engine.commitDrags(instance);

            expect(getDragEmit()).toHaveBeenCalled();
        });

        it('drag=undefined 仅使用模板声明', () => {
            const { instance, getDragEmit } = createMockInstance();
            instance.drag = undefined;
            instance.nodeMap = {
                body: { el: document.createElement('div'), drag: true },
            };

            engine.commitDrags(instance);

            expect(getDragEmit()).toHaveBeenCalled();
        });
    });

    describe('commitDrops', () => {
        it('无 id 时不操作', () => {
            const { instance, getDragEmit } = createMockInstance();
            instance.id = null;

            expect(() => engine.commitDrops(instance)).not.toThrow();
        });

        it('drop=false 禁用放置区', () => {
            const { instance } = createMockInstance();
            instance.drop = false;

            expect(() => engine.commitDrops(instance)).not.toThrow();
        });
    });
});
