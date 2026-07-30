import { DragAbility } from '@/component-core/abilities/DragAbility';
import { DRAG_ACTIONS } from '@/events/drag-events';

describe('DragAbility', () => {
    function createMockInstance(initialCache: Record<string, any> = {}) {
        let cache = { ...initialCache };

        const instance: any = {
            id: 'comp-1',
            props: {},
            _initializing: false,
            _syncDrags: jest.fn(),
            _emitDragInit: jest.fn(),
            _emitDragAction: jest.fn(),
            abilityState: jest.fn((key: string, creator?: () => any) => {
                return cache;
            }),
            setAbilityState: jest.fn((key: string, val: any) => {
                cache = val;
            }),
            get drags() {
                return Object.keys(cache).length > 0 ? cache : undefined;
            },
            set drags(val: any) {
                cache = val ?? {};
            },
            dragEmit: jest.fn(),
        };

        return {
            instance,
            getCache: () => cache,
            _syncDrags: instance._syncDrags,
            _emitDragInit: instance._emitDragInit,
            _emitDragAction: instance._emitDragAction,
        };
    }

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

        it('key 不存在时不调用 setter', () => {
            const { instance, getCache } = createMockInstance({ handle: { axis: 'y' } });
            const before = { ...getCache() };

            DragAbility.detachDrag.call(instance, 'nonExist');

            expect(getCache()).toEqual(before);
        });

        it('移除最后一个 key 时设为 undefined', () => {
            const { instance } = createMockInstance({ handle: { axis: 'y' } });
            const dragsSetter = jest.fn();
            Object.defineProperty(instance, 'drags', {
                get() { return {}; },
                set(val: any) { dragsSetter(val); },
                configurable: true,
            });

            DragAbility.detachDrag.call(instance, 'handle');

            expect(dragsSetter).toHaveBeenCalledWith(undefined);
        });
    });

    describe('startDrag', () => {
        it('发送 START 事件', () => {
            const dragEmit = jest.fn();
            const instance = { id: 'comp-1', dragEmit };

            DragAbility.startDrag.call(instance, 'handle');

            expect(dragEmit).toHaveBeenCalledTimes(1);
            const ctx = dragEmit.mock.calls[0][0];
            expect(ctx.type).toBe(DRAG_ACTIONS.START);
            expect(ctx.source).toBe('comp-1:handle');
        });
    });

    describe('stopDrag', () => {
        it('发送 STOP 事件', () => {
            const dragEmit = jest.fn();
            const instance = { id: 'comp-1', dragEmit };

            DragAbility.stopDrag.call(instance, 'handle');

            expect(dragEmit).toHaveBeenCalledTimes(1);
            const ctx = dragEmit.mock.calls[0][0];
            expect(ctx.type).toBe(DRAG_ACTIONS.STOP);
            expect(ctx.source).toBe('comp-1:handle');
        });
    });

    describe('_commitDrags (auto mode)', () => {
        it('drag=true 时自动添加 self 拖拽', () => {
            const { instance, getCache, _syncDrags } = createMockInstance();
            instance.drag = true;

            DragAbility._commitDrags.call(instance);

            expect(getCache().self).toEqual({});
            expect(_syncDrags).toHaveBeenCalled();
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
            const { instance, getCache, _syncDrags } = createMockInstance();
            instance.drag = false;
            instance.nodeMap = {
                root: { drag: undefined },
                header: { drag: true, el: {} },
                body: { drag: { axis: 'x' }, el: {} },
            };

            DragAbility._commitDrags.call(instance);

            expect(Object.keys(getCache()).length).toBe(0);
            expect(_syncDrags).not.toHaveBeenCalled();
        });

        it('drag=false 时抑制模板拖拽但保留手动 attachDrag 的缓存', () => {
            const { instance, getCache, _syncDrags } = createMockInstance({
                handle: { axis: 'y' },
            });
            instance.drag = false;
            instance.nodeMap = {
                root: { drag: undefined },
                header: { drag: true, el: {} },
            };

            DragAbility._commitDrags.call(instance);

            expect(getCache().handle).toEqual({ axis: 'y' });
            expect(_syncDrags).toHaveBeenCalled();
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

            // 模板中有 drag 节点，不再默认加 self
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

            // dragHandle 优先级高于模板声明
            expect(getCache().customHandle).toEqual({});
            expect(getCache().header).toBeUndefined();
        });
    });

    describe('_syncDrags', () => {
        it('新增 key 发送 INIT 事件', () => {
            const instance: any = {
                id: 'comp-1',
                _emitDragInit: jest.fn(),
                _emitDragAction: jest.fn(),
            };

            DragAbility._syncDrags.call(instance, {}, { handle: { axis: 'y' } });

            expect(instance._emitDragInit).toHaveBeenCalledTimes(1);
            expect(instance._emitDragInit).toHaveBeenCalledWith('handle', { axis: 'y' });
        });

        it('移除 key 发送 DISPOSE 事件', () => {
            const instance: any = {
                id: 'comp-1',
                _emitDragInit: jest.fn(),
                _emitDragAction: jest.fn(),
            };

            DragAbility._syncDrags.call(instance, { handle: { axis: 'y' } }, {});

            expect(instance._emitDragAction).toHaveBeenCalledTimes(1);
            expect(instance._emitDragAction).toHaveBeenCalledWith('handle', DRAG_ACTIONS.DISPOSE);
        });

        it('配置变更先发 DISPOSE 再发 INIT', () => {
            const instance: any = {
                id: 'comp-1',
                _emitDragInit: jest.fn(),
                _emitDragAction: jest.fn(),
            };

            DragAbility._syncDrags.call(
                instance,
                { handle: { axis: 'y' } },
                { handle: { axis: 'x' } }
            );

            expect(instance._emitDragAction).toHaveBeenCalledWith('handle', DRAG_ACTIONS.DISPOSE);
            expect(instance._emitDragInit).toHaveBeenCalledWith('handle', { axis: 'x' });
        });
    });

    describe('_emitDragInit', () => {
        it('发送 INIT 事件', () => {
            const dragEmit = jest.fn();
            const instance = { id: 'comp-1', dragEmit };

            DragAbility._emitDragInit.call(instance, 'handle', { axis: 'y' });

            expect(dragEmit).toHaveBeenCalledTimes(1);
            const ctx = dragEmit.mock.calls[0][0];
            expect(ctx.type).toBe(DRAG_ACTIONS.INIT);
            expect(ctx.source).toBe('comp-1');
        });
    });

    describe('_emitDragAction', () => {
        it('发送指定 action 事件', () => {
            const dragEmit = jest.fn();
            const instance = { id: 'comp-1', dragEmit };

            DragAbility._emitDragAction.call(instance, 'handle', DRAG_ACTIONS.DISPOSE);

            expect(dragEmit).toHaveBeenCalledTimes(1);
            const ctx = dragEmit.mock.calls[0][0];
            expect(ctx.type).toBe(DRAG_ACTIONS.DISPOSE);
            expect(ctx.source).toBe('comp-1:handle');
        });
    });

    describe('_commitDrops (auto mode)', () => {
        let registerDropZoneMock: jest.Mock;

        beforeEach(() => {
            // Mock dragDispatchCenter.registerDropZone
            registerDropZoneMock = jest.fn();
            jest.mock('@/drag/DragDispatchCenter', () => ({
                dragDispatchCenter: {
                    registerDropZone: registerDropZoneMock,
                    unregisterDropZone: jest.fn(),
                },
            }), { virtual: true });
        });

        it('drop=false 时禁用所有放置区（抑制模式）', () => {
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

                // drop=false 时，不应该注册任何放置区
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

                // 应该注册两个放置区
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

                // drop=true 时，应该以自身 el 注册放置区
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
    });
});