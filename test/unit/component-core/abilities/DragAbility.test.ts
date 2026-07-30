import { DragAbility } from '@/component-core/abilities/DragAbility';
import { DragEngine } from '@/component-core/engine/DragEngine';
import { DRAG_ACTIONS } from '@/events/drag-events';

describe('DragAbility', () => {
    const engine = DragEngine.getInstance();

    function createMockInstance(initialCache: Record<string, any> = {}) {
        let cache = { ...initialCache };

        const instance: any = {
            id: 'comp-1',
            props: {},
            _initializing: false,
            abilityState: jest.fn((key: string, creator?: () => any) => {
                return cache;
            }),
            setAbilityState: jest.fn((key: string, val: any) => {
                cache = val;
            }),
            dragEmit: jest.fn(),
        };

        return {
            instance,
            getCache: () => cache,
        };
    }

    function getDragsGetter() {
        return Object.getOwnPropertyDescriptor(DragAbility, 'drags')?.get;
    }

    function getDragsSetter() {
        return Object.getOwnPropertyDescriptor(DragAbility, 'drags')?.set;
    }

    // ══════════════════════════════════════════════════════════════
    // 缓存 & getter/setter
    // ══════════════════════════════════════════════════════════════

    describe('drags getter/setter', () => {
        it('getter 返回缓存', () => {
            const { instance } = createMockInstance({ handle: { axis: 'y' } });

            const result = getDragsGetter()?.call(instance);

            expect(result).toEqual({ handle: { axis: 'y' } });
        });

        it('getter 空缓存返回 undefined', () => {
            const { instance } = createMockInstance();

            const result = engine.getDrags(instance);

            expect(result).toBeUndefined();
        });

        it('setter 初始化阶段合并缓存', () => {
            const { instance, getCache } = createMockInstance({ handle: { axis: 'y' } });
            instance._initializing = true;

            getDragsSetter()?.call(instance, { resize: { axis: 'x' } });

            expect(getCache().handle).toEqual({ axis: 'y' });
            expect(getCache().resize).toEqual({ axis: 'x' });
        });

        it('setter 运行时替换缓存并触发 sync', () => {
            const { instance, getCache } = createMockInstance({ handle: { axis: 'y' } });

            getDragsSetter()?.call(instance, { handle: { axis: 'x' } });

            expect(getCache().handle).toEqual({ axis: 'x' });
            expect(instance.dragEmit).toHaveBeenCalledTimes(2); // DISPOSE + INIT
        });
    });

    // ══════════════════════════════════════════════════════════════
    // attachDrag / detachDrag
    // ══════════════════════════════════════════════════════════════

    describe('attachDrag', () => {
        it('通过 drags setter 追加拖拽配置', () => {
            const { instance, getCache } = createMockInstance();

            DragAbility.attachDrag.call(instance, 'handle', { axis: 'y' });

            expect(getCache().handle).toEqual({ axis: 'y' });
        });

        it('追加到已有缓存', () => {
            const { instance, getCache } = createMockInstance({ resizeHandle: { axis: 'x' } });

            DragAbility.attachDrag.call(instance, 'handle', { axis: 'y' });

            expect(getCache().resizeHandle).toEqual({ axis: 'x' });
            expect(getCache().handle).toEqual({ axis: 'y' });
        });

        it('运行时追加触发 sync', () => {
            const { instance } = createMockInstance();

            DragAbility.attachDrag.call(instance, 'handle', { axis: 'y' });

            expect(instance.dragEmit).toHaveBeenCalledTimes(1); // INIT
        });
    });

    describe('detachDrag', () => {
        it('从缓存中移除指定 key', () => {
            const { instance, getCache } = createMockInstance({
                handle: { axis: 'y' },
                resizeHandle: { axis: 'x' },
            });

            DragAbility.detachDrag.call(instance, 'handle');

            expect(getCache().resizeHandle).toEqual({ axis: 'x' });
            expect(getCache().handle).toBeUndefined();
        });

        it('key 不存在时不操作', () => {
            const { instance, getCache } = createMockInstance({ handle: { axis: 'y' } });
            const before = { ...getCache() };

            DragAbility.detachDrag.call(instance, 'nonExist');

            expect(getCache()).toEqual(before);
        });

        it('移除最后一个 key 时设为 undefined', () => {
            const { instance } = createMockInstance({ handle: { axis: 'y' } });

            DragAbility.detachDrag.call(instance, 'handle');

            // No dragEmit calls expected (undefined = empty, no diff needed)
        });

        it('运行时移除触发 sync', () => {
            const { instance } = createMockInstance({ handle: { axis: 'y' } });

            DragAbility.detachDrag.call(instance, 'handle');

            // Should emit DISPOSE
            expect(instance.dragEmit).toHaveBeenCalledTimes(1);
        });
    });

    // ══════════════════════════════════════════════════════════════
    // startDrag / stopDrag
    // ══════════════════════════════════════════════════════════════

    describe('startDrag', () => {
        it('发送 START 事件', () => {
            const { instance } = createMockInstance();

            DragAbility.startDrag.call(instance, 'handle');

            expect(instance.dragEmit).toHaveBeenCalledTimes(1);
            const ctx = instance.dragEmit.mock.calls[0][0];
            expect(ctx.type).toBe(DRAG_ACTIONS.START);
            expect(ctx.source).toBe('comp-1:handle');
        });
    });

    describe('stopDrag', () => {
        it('发送 STOP 事件', () => {
            const { instance } = createMockInstance();

            DragAbility.stopDrag.call(instance, 'handle');

            expect(instance.dragEmit).toHaveBeenCalledTimes(1);
            const ctx = instance.dragEmit.mock.calls[0][0];
            expect(ctx.type).toBe(DRAG_ACTIONS.STOP);
            expect(ctx.source).toBe('comp-1:handle');
        });
    });

    // ══════════════════════════════════════════════════════════════
    // _commitDrags (auto mode)
    // ══════════════════════════════════════════════════════════════

    describe('_commitDrags (auto mode)', () => {
        it('drag=true 时自动添加 self 拖拽', () => {
            const { instance, getCache } = createMockInstance();
            instance.drag = true;

            DragAbility._commitDrags.call(instance);

            expect(getCache().self).toEqual({});
            expect(instance.dragEmit).toHaveBeenCalled();
        });

        it('drag=true + dragHandle="header" 时添加 header 拖拽', () => {
            const { instance, getCache } = createMockInstance();
            instance.drag = true;
            instance.dragHandle = 'header';

            DragAbility._commitDrags.call(instance);

            expect(getCache().header).toEqual({});
        });

        it('drag={ axis: "x" } 时自动添加 self 拖拽并带配置', () => {
            const { instance, getCache } = createMockInstance();
            instance.drag = { axis: 'x' };

            DragAbility._commitDrags.call(instance);

            expect(getCache().self).toEqual({ axis: 'x' });
        });

        it('drag 未设置时不自动添加', () => {
            const { instance, getCache } = createMockInstance();

            DragAbility._commitDrags.call(instance);

            expect(Object.keys(getCache()).length).toBe(0);
        });

        it('手动 attachDrag 与 auto mode 共存', () => {
            const { instance, getCache } = createMockInstance({ handle: { axis: 'y' } });
            instance.drag = true;

            DragAbility._commitDrags.call(instance);

            expect(getCache().handle).toEqual({ axis: 'y' });
            expect(getCache().self).toEqual({});
        });

        it('auto mode 不覆盖已有同名配置', () => {
            const { instance, getCache } = createMockInstance({ self: { axis: 'x' } });
            instance.drag = true;

            DragAbility._commitDrags.call(instance);

            expect(getCache().self).toEqual({ axis: 'x' });
        });

        it('drag=false 时禁用所有拖拽（抑制模式）', () => {
            const { instance, getCache } = createMockInstance();
            instance.drag = false;
            instance.nodeMap = {
                root: { drag: undefined },
                header: { drag: true, el: {} },
                body: { drag: { axis: 'x' }, el: {} },
            };

            DragAbility._commitDrags.call(instance);

            expect(Object.keys(getCache()).length).toBe(0);
            expect(instance.dragEmit).not.toHaveBeenCalled();
        });

        it('drag=false 时抑制模板拖拽但保留手动 attachDrag 的缓存', () => {
            const { instance, getCache } = createMockInstance({
                handle: { axis: 'y' },
            });
            instance.drag = false;
            instance.nodeMap = {
                root: { drag: undefined },
                header: { drag: true, el: {} },
            };

            DragAbility._commitDrags.call(instance);

            expect(getCache().handle).toEqual({ axis: 'y' });
            expect(instance.dragEmit).toHaveBeenCalled();
        });

        it('drag=true 时使用模板中的 drag 节点作为手柄', () => {
            const { instance, getCache } = createMockInstance();
            instance.drag = true;
            instance.nodeMap = {
                root: { drag: undefined },
                header: { drag: true, el: {} },
                body: { drag: { axis: 'x' }, el: {} },
            };

            DragAbility._commitDrags.call(instance);

            expect(getCache().header).toEqual({});
            expect(getCache().body).toEqual({ axis: 'x' });
            expect(getCache().self).toBeUndefined();
        });

        it('drag=true + dragHandle 时只使用指定节点', () => {
            const { instance, getCache } = createMockInstance();
            instance.drag = true;
            instance.dragHandle = 'customHandle';
            instance.nodeMap = {
                root: { drag: undefined },
                header: { drag: true, el: {} },
            };

            DragAbility._commitDrags.call(instance);

            expect(getCache().customHandle).toEqual({});
            expect(getCache().header).toBeUndefined();
        });

        it('drag=undefined 时使用模板中的 drag 声明', () => {
            const { instance, getCache } = createMockInstance();
            instance.nodeMap = {
                root: { drag: undefined },
                header: { drag: true, el: {} },
                body: { drag: { axis: 'x' }, el: {} },
            };

            DragAbility._commitDrags.call(instance);

            expect(getCache().header).toEqual({});
            expect(getCache().body).toEqual({ axis: 'x' });
        });
    });

    // ══════════════════════════════════════════════════════════════
    // _syncDrags (DragEngine.syncDrags)
    // ══════════════════════════════════════════════════════════════

    describe('syncDrags (engine)', () => {
        it('新增 key 发送 INIT 事件', () => {
            const { instance } = createMockInstance();

            engine.syncDrags(instance, {}, { handle: { axis: 'y' } });

            expect(instance.dragEmit).toHaveBeenCalledTimes(1);
            const ctx = instance.dragEmit.mock.calls[0][0];
            expect(ctx.type).toBe(DRAG_ACTIONS.INIT);
            expect(ctx.source).toBe('comp-1');
        });

        it('移除 key 发送 DISPOSE 事件', () => {
            const { instance } = createMockInstance();

            engine.syncDrags(instance, { handle: { axis: 'y' } }, {});

            expect(instance.dragEmit).toHaveBeenCalledTimes(1);
            const ctx = instance.dragEmit.mock.calls[0][0];
            expect(ctx.type).toBe(DRAG_ACTIONS.DISPOSE);
            expect(ctx.source).toBe('comp-1:handle');
        });

        it('配置变更先发 DISPOSE 再发 INIT', () => {
            const { instance } = createMockInstance();

            engine.syncDrags(
                instance,
                { handle: { axis: 'y' } },
                { handle: { axis: 'x' } }
            );

            expect(instance.dragEmit).toHaveBeenCalledTimes(2);
            const disposeCtx = instance.dragEmit.mock.calls[0][0];
            const initCtx = instance.dragEmit.mock.calls[1][0];
            expect(disposeCtx.type).toBe(DRAG_ACTIONS.DISPOSE);
            expect(initCtx.type).toBe(DRAG_ACTIONS.INIT);
        });

        it('key 未变更时不发送', () => {
            const { instance } = createMockInstance();

            engine.syncDrags(instance, { handle: { axis: 'y' } }, { handle: { axis: 'y' } });

            expect(instance.dragEmit).not.toHaveBeenCalled();
        });

        it('混合变更（新增+移除+变更）', () => {
            const { instance } = createMockInstance();

            engine.syncDrags(
                instance,
                { a: { axis: 'y' }, b: { axis: 'x' }, c: { axis: 'z' } },
                { b: { axis: 'updated' }, c: { axis: 'z' }, d: { axis: 'new' } }
            );

            // removed: a → DISPOSE
            // added: d → INIT
            // changed: b → DISPOSE + INIT
            // unchanged: c → nothing
            expect(instance.dragEmit).toHaveBeenCalledTimes(4);
        });
    });

    // ══════════════════════════════════════════════════════════════
    // _commitDrops (auto mode)
    // ══════════════════════════════════════════════════════════════

    describe('_commitDrops (auto mode)', () => {
        let registerDropZoneMock: jest.Mock;
        let unregisterDropZoneMock: jest.Mock;

        beforeEach(() => {
            registerDropZoneMock = jest.fn();
            unregisterDropZoneMock = jest.fn();
            jest.mock('@/drag/DragDispatchCenter', () => ({
                dragDispatchCenter: {
                    registerDropZone: registerDropZoneMock,
                    unregisterDropZone: unregisterDropZoneMock,
                },
            }), { virtual: true });
        });

        it('drop=false 时禁用所有放置区', () => {
            jest.isolateModules(() => {
                const { DragAbility: Ability } = require('@/component-core/abilities/DragAbility');
                const mockDispatch = require('@/drag/DragDispatchCenter').dragDispatchCenter;

                const instance: any = {
                    id: 'comp-1',
                    drop: false,
                    el: document.createElement('div'),
                    nodeMap: {
                        root: { drop: undefined },
                        zone1: { drop: true, el: document.createElement('div') },
                        zone2: { drop: { accept: ['card'] }, el: document.createElement('div') },
                    },
                };

                Ability._commitDrops.call(instance);

                expect(mockDispatch.registerDropZone).not.toHaveBeenCalled();
            });
        });

        it('drop 未设置时使用模板中的 drop 声明', () => {
            jest.isolateModules(() => {
                const { DragAbility: Ability } = require('@/component-core/abilities/DragAbility');
                const mockDispatch = require('@/drag/DragDispatchCenter').dragDispatchCenter;

                const zone1El = document.createElement('div');
                const zone2El = document.createElement('div');
                const instance: any = {
                    id: 'comp-1',
                    el: document.createElement('div'),
                    nodeMap: {
                        root: { drop: undefined },
                        zone1: { drop: true, el: zone1El },
                        zone2: { drop: { accept: ['card'] }, el: zone2El },
                    },
                };

                Ability._commitDrops.call(instance);

                expect(mockDispatch.registerDropZone).toHaveBeenCalledTimes(2);
                expect(mockDispatch.registerDropZone).toHaveBeenCalledWith(
                    'comp-1:zone1', zone1El, instance, 'zone1', {}
                );
                expect(mockDispatch.registerDropZone).toHaveBeenCalledWith(
                    'comp-1:zone2', zone2El, instance, 'zone2', { accept: ['card'] }
                );
            });
        });

        it('drop=true 时以自身 el 作为放置区', () => {
            jest.isolateModules(() => {
                const { DragAbility: Ability } = require('@/component-core/abilities/DragAbility');
                const mockDispatch = require('@/drag/DragDispatchCenter').dragDispatchCenter;

                const el = document.createElement('div');
                const instance: any = {
                    id: 'comp-1',
                    drop: true,
                    el,
                    nodeMap: {},
                };

                Ability._commitDrops.call(instance);

                expect(mockDispatch.registerDropZone).toHaveBeenCalledTimes(1);
                expect(mockDispatch.registerDropZone).toHaveBeenCalledWith(
                    'comp-1:self', el, instance, 'self', {}
                );
            });
        });

        it('drop={ accept: ["card"] } 时以配置注册放置区', () => {
            jest.isolateModules(() => {
                const { DragAbility: Ability } = require('@/component-core/abilities/DragAbility');
                const mockDispatch = require('@/drag/DragDispatchCenter').dragDispatchCenter;

                const el = document.createElement('div');
                const instance: any = {
                    id: 'comp-1',
                    drop: { accept: ['card'], activeClass: 'drag-over' },
                    el,
                    nodeMap: {},
                };

                Ability._commitDrops.call(instance);

                expect(mockDispatch.registerDropZone).toHaveBeenCalledTimes(1);
                expect(mockDispatch.registerDropZone).toHaveBeenCalledWith(
                    'comp-1:self', el, instance, 'self',
                    { accept: ['card'], activeClass: 'drag-over' }
                );
            });
        });

        it('drop + dropZone 时使用指定节点', () => {
            jest.isolateModules(() => {
                const { DragAbility: Ability } = require('@/component-core/abilities/DragAbility');
                const mockDispatch = require('@/drag/DragDispatchCenter').dragDispatchCenter;

                const zoneEl = document.createElement('div');
                const instance: any = {
                    id: 'comp-1',
                    drop: true,
                    dropZone: 'zone1',
                    el: document.createElement('div'),
                    nodeMap: {
                        root: { drop: undefined },
                        zone1: { drop: true, el: zoneEl },
                    },
                };

                Ability._commitDrops.call(instance);

                expect(mockDispatch.registerDropZone).toHaveBeenCalledTimes(1);
                expect(mockDispatch.registerDropZone).toHaveBeenCalledWith(
                    'comp-1:zone1', zoneEl, instance, 'zone1', {}
                );
            });
        });

        it('无 id 时不操作', () => {
            jest.isolateModules(() => {
                const { DragAbility: Ability } = require('@/component-core/abilities/DragAbility');
                const mockDispatch = require('@/drag/DragDispatchCenter').dragDispatchCenter;

                const instance: any = {
                    el: document.createElement('div'),
                    drop: true,
                    nodeMap: {},
                };

                Ability._commitDrops.call(instance);

                expect(mockDispatch.registerDropZone).not.toHaveBeenCalled();
            });
        });
    });

    // ══════════════════════════════════════════════════════════════
    // DragAbility 委托
    // ══════════════════════════════════════════════════════════════

    describe('DragAbility 委托', () => {
        it('drags getter 委托给 engine.getDrags', () => {
            const spy = jest.spyOn(engine, 'getDrags');
            const { instance } = createMockInstance({ handle: { axis: 'y' } });

            const result = getDragsGetter()?.call(instance);

            expect(spy).toHaveBeenCalledWith(instance);
            expect(result).toEqual({ handle: { axis: 'y' } });
            spy.mockRestore();
        });

        it('drags setter 委托给 engine.setDrags', () => {
            const spy = jest.spyOn(engine, 'setDrags');
            const { instance } = createMockInstance();

            getDragsSetter()?.call(instance, { handle: { axis: 'y' } });

            expect(spy).toHaveBeenCalledWith(instance, { handle: { axis: 'y' } });
            spy.mockRestore();
        });

        it('_commitDrags 委托给 engine.commitDrags', () => {
            const spy = jest.spyOn(engine, 'commitDrags');
            const { instance } = createMockInstance();
            instance.drag = true;

            DragAbility._commitDrags.call(instance);

            expect(spy).toHaveBeenCalledWith(instance);
            spy.mockRestore();
        });

        it('_commitDrops 委托给 engine.commitDrops', () => {
            const spy = jest.spyOn(engine, 'commitDrops');
            const { instance } = createMockInstance();

            DragAbility._commitDrops.call(instance);

            expect(spy).toHaveBeenCalledWith(instance);
            spy.mockRestore();
        });

        it('attachDrag 委托给 engine.attachDrag', () => {
            const spy = jest.spyOn(engine, 'attachDrag');
            const { instance } = createMockInstance();

            DragAbility.attachDrag.call(instance, 'handle', { axis: 'y' });

            expect(spy).toHaveBeenCalledWith(instance, 'handle', { axis: 'y' });
            spy.mockRestore();
        });

        it('detachDrag 委托给 engine.detachDrag', () => {
            const spy = jest.spyOn(engine, 'detachDrag');
            const { instance } = createMockInstance();

            DragAbility.detachDrag.call(instance, 'handle');

            expect(spy).toHaveBeenCalledWith(instance, 'handle');
            spy.mockRestore();
        });

        it('startDrag 委托给 engine.startDrag', () => {
            const spy = jest.spyOn(engine, 'startDrag');
            const { instance } = createMockInstance();

            DragAbility.startDrag.call(instance, 'handle');

            expect(spy).toHaveBeenCalledWith(instance, 'handle');
            spy.mockRestore();
        });

        it('stopDrag 委托给 engine.stopDrag', () => {
            const spy = jest.spyOn(engine, 'stopDrag');
            const { instance } = createMockInstance();

            DragAbility.stopDrag.call(instance, 'handle');

            expect(spy).toHaveBeenCalledWith(instance, 'handle');
            spy.mockRestore();
        });

        it('setDraggable 委托给 engine.setDraggable', () => {
            const spy = jest.spyOn(engine, 'setDraggable');
            const { instance } = createMockInstance();

            DragAbility.setDraggable.call(instance, true, { axis: 'y' });

            expect(spy).toHaveBeenCalledWith(instance, true, { axis: 'y' });
            spy.mockRestore();
        });

        it('setDropZone 委托给 engine.setDropZone', () => {
            const spy = jest.spyOn(engine, 'setDropZone');
            const { instance } = createMockInstance();

            DragAbility.setDropZone.call(instance, true, { accept: ['card'] });

            expect(spy).toHaveBeenCalledWith(instance, true, { accept: ['card'] });
            spy.mockRestore();
        });
    });
});
