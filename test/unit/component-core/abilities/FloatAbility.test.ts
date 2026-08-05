import { FloatAbility } from '@/component-core/abilities/FloatAbility';
import { FloatEngine } from '@/component-core/engine/FloatEngine';
import { OVERLAY_ACTIONS } from '@/events/overlay-events';
import type { FloatDecl } from '@/component-core/types/tpl-node-types';

describe('FloatAbility', () => {
    const engine = FloatEngine.getInstance();

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
            overlayEmit: jest.fn(),
            get floats() {
                return engine.getFloats(instance);
            },
            set floats(val: any) {
                engine.setFloats(instance, val);
            },
        };

        return {
            instance,
            getCache: () => cache,
            getOverlayEmit: () => instance.overlayEmit,
        };
    }

    // ══════════════════════════════════════════════════════════════
    // FloatEngine — 类型处理器
    // ══════════════════════════════════════════════════════════════

    describe('类型处理器', () => {
        it('注册新类型处理器', () => {
            const handler = jest.fn(() => ({ type: 'Custom' }) as FloatDecl);
            engine.registerHandler('customType', handler);

            const result = engine.buildFromProps({ props: { customType: { foo: 'bar' } } });

            expect(result.customType).toBeDefined();
            expect(handler).toHaveBeenCalledWith({ foo: 'bar' });
        });
    });

    // ══════════════════════════════════════════════════════════════
    // buildFromProps（handler 注册表驱动）
    // ══════════════════════════════════════════════════════════════

    describe('buildFromProps', () => {
        it('从 props.tooltip 构建浮层配置', () => {
            const result = engine.buildFromProps({ props: { tooltip: '保存' } });

            expect(result.tooltip).toBeDefined();
            expect(result.tooltip.type).toBe('Tooltip');
            expect(result.tooltip.trigger).toBe('hover');
            expect(result.tooltip.placement).toBe('top');
            expect(result.tooltip.data.tooltip).toBe('保存');
        });

        it('从 props.tooltip 对象构建', () => {
            const result = engine.buildFromProps({
                props: { tooltip: { tooltip: '提示', placement: 'bottom', showDelay: 300 } },
            });

            expect(result.tooltip.placement).toBe('bottom');
            expect(result.tooltip.showDelay).toBe(300);
            expect(result.tooltip.data.tooltip).toBe('提示');
        });

        it('tooltip 和 dialog 同时存在', () => {
            const result = engine.buildFromProps({
                props: { tooltip: '删除', dialog: { title: '确认' } },
            });

            expect(result.tooltip).toBeDefined();
            expect(result.dialog).toBeDefined();
        });

        it('从 props.dialog 构建浮层配置', () => {
            const result = engine.buildFromProps({
                props: { dialog: { title: '确认删除', confirm: true, cancel: true } },
            });

            expect(result.dialog).toBeDefined();
            expect(result.dialog.type).toBe('Dialog');
            expect(result.dialog.trigger).toBe('manual');
            expect(result.dialog.placement).toBe('center');
            expect(result.dialog.mask).toBe(true);
            expect(result.dialog.closeOnEscape).toBe(true);
            expect(result.dialog.closeOnClickOutside).toBe(false);
            expect(result.dialog.data.title).toBe('确认删除');
            expect(result.dialog.data.confirm).toBe(true);
            expect(result.dialog.data.cancel).toBe(true);
        });

        it('props.dialog 可自定义 float 选项', () => {
            const result = engine.buildFromProps({
                props: {
                    dialog: {
                        title: '提示',
                        mask: false,
                        closeOnEscape: false,
                        closeOnClickOutside: true,
                    },
                },
            });

            expect(result.dialog.mask).toBe(false);
            expect(result.dialog.closeOnEscape).toBe(false);
            expect(result.dialog.closeOnClickOutside).toBe(true);
            expect(result.dialog.data.mask).toBeUndefined();
            expect(result.dialog.data.closeOnEscape).toBeUndefined();
            expect(result.dialog.data.title).toBe('提示');
        });

        it('props.dialog 带 emits 事件转发', () => {
            const result = engine.buildFromProps({
                props: {
                    dialog: {
                        title: '保存',
                        emits: { shown: 'dialogOpen', hidden: 'dialogClose' },
                    },
                },
            });

            expect(result.dialog.emits).toEqual({ shown: 'dialogOpen', hidden: 'dialogClose' });
            expect(result.dialog.data.emits).toBeUndefined();
        });

        it('tooltip + dialog 同时存在', () => {
            const result = engine.buildFromProps({
                props: { tooltip: '删除', dialog: { title: '确认' } },
            });

            expect(result.tooltip).toBeDefined();
            expect(result.dialog).toBeDefined();
        });

        it('dialog: null 时不触发', () => {
            const result = engine.buildFromProps({ props: { dialog: null } });

            expect(result.dialog).toBeUndefined();
        });

        it('无 tooltip/dialog 时返回空', () => {
            const result = engine.buildFromProps({ props: {} });

            expect(Object.keys(result)).toHaveLength(0);
        });
    });

    // ══════════════════════════════════════════════════════════════
    // FloatEngine — 缓存管理
    // ══════════════════════════════════════════════════════════════

    describe('缓存管理', () => {
        it('getCache / setCache', () => {
            const { instance, getCache } = createMockInstance();

            engine.setCache(instance, { badge: { type: 'Badge' } as FloatDecl });

            expect(getCache()).toEqual({ badge: { type: 'Badge' } });
        });

        it('getFloats 空缓存返回 undefined', () => {
            const { instance } = createMockInstance();

            expect(engine.getFloats(instance)).toBeUndefined();
        });

        it('getFloats 有缓存返回配置', () => {
            const { instance } = createMockInstance();
            engine.setCache(instance, { badge: { type: 'Badge' } as FloatDecl });

            expect(engine.getFloats(instance)).toEqual({ badge: { type: 'Badge' } });
        });

        it('setFloats 初始化阶段合并缓存', () => {
            const { instance, getCache } = createMockInstance({
                existing: { type: 'Existing' },
            });
            instance._initializing = true;

            engine.setFloats(instance, { badge: { type: 'Badge' } as FloatDecl });

            expect(getCache().existing).toBeDefined();
            expect(getCache().badge).toBeDefined();
        });

        it('setFloats 运行时触发 syncFloats', () => {
            const { instance, getCache, getOverlayEmit } = createMockInstance({
                badge: { type: 'Badge' },
            });
            instance._initializing = false;

            engine.setFloats(instance, { tooltip: { type: 'Tooltip' } as FloatDecl });

            expect(getCache().badge).toBeUndefined();
            expect(getCache().tooltip).toBeDefined();
            expect(getOverlayEmit()).toHaveBeenCalled();
        });
    });

    // ══════════════════════════════════════════════════════════════
    // FloatEngine — commitFloats
    // ══════════════════════════════════════════════════════════════

    describe('commitFloats', () => {
        it('有缓存时直接 diff 提交', () => {
            const { instance, getOverlayEmit } = createMockInstance({
                badge: { type: 'Badge' },
            });

            engine.commitFloats(instance);

            expect(getOverlayEmit()).toHaveBeenCalledTimes(1);
        });

        it('空缓存时不调用 overlayEmit', () => {
            const { instance, getOverlayEmit } = createMockInstance();

            engine.commitFloats(instance);

            expect(getOverlayEmit()).not.toHaveBeenCalled();
        });
    });

    // ══════════════════════════════════════════════════════════════
    // FloatEngine — attachFloat / detachFloat
    // ══════════════════════════════════════════════════════════════

    describe('attachFloat', () => {
        it('初始化阶段追加到缓存', () => {
            const { instance, getCache } = createMockInstance();
            instance._initializing = true;

            engine.attachFloat(instance, 'dropBtn', {
                type: 'Menu',
                trigger: 'click',
            } as FloatDecl);

            expect(getCache().dropBtn).toEqual({ type: 'Menu', trigger: 'click' });
        });

        it('追加到已有缓存', () => {
            const { instance, getCache } = createMockInstance({
                badge: { type: 'Badge' },
            });
            instance._initializing = true;

            engine.attachFloat(instance, 'dropBtn', { type: 'Menu' } as FloatDecl);

            expect(getCache().badge).toEqual({ type: 'Badge' });
            expect(getCache().dropBtn).toEqual({ type: 'Menu' });
        });

        it('运行时追加触发 syncFloats', () => {
            const { instance, getCache, getOverlayEmit } = createMockInstance({
                badge: { type: 'Badge' },
            });
            instance._initializing = false;

            engine.attachFloat(instance, 'dropBtn', { type: 'Menu' } as FloatDecl);

            expect(getCache().dropBtn).toBeDefined();
            expect(getOverlayEmit()).toHaveBeenCalledTimes(1);
        });
    });

    describe('detachFloat', () => {
        it('从缓存中移除指定 key', () => {
            const { instance, getCache } = createMockInstance({
                badge: { type: 'Badge' },
                dropBtn: { type: 'Menu' },
            });
            instance._initializing = true;

            engine.detachFloat(instance, 'dropBtn');

            expect(getCache().badge).toEqual({ type: 'Badge' });
            expect(getCache().dropBtn).toBeUndefined();
        });

        it('key 不存在时不操作', () => {
            const { instance, getCache, getOverlayEmit } = createMockInstance({
                badge: { type: 'Badge' },
            });
            instance._initializing = true;
            const before = { ...getCache() };

            engine.detachFloat(instance, 'nonExist');

            expect(getCache()).toEqual(before);
            expect(getOverlayEmit()).not.toHaveBeenCalled();
        });

        it('移除最后一个 key 时空缓存', () => {
            const { instance, getCache } = createMockInstance({
                badge: { type: 'Badge' },
            });
            instance._initializing = true;

            engine.detachFloat(instance, 'badge');

            expect(Object.keys(getCache())).toHaveLength(0);
        });

        it('运行时移除触发 syncFloats', () => {
            const { instance, getOverlayEmit } = createMockInstance({
                badge: { type: 'Badge' },
                dropBtn: { type: 'Menu' },
            });
            instance._initializing = false;

            engine.detachFloat(instance, 'dropBtn');

            expect(getOverlayEmit()).toHaveBeenCalledTimes(1);
        });
    });

    // ══════════════════════════════════════════════════════════════
    // FloatEngine — syncFloats diff 逻辑
    // ══════════════════════════════════════════════════════════════

    describe('syncFloats', () => {
        it('新增 key 时发送 INIT', () => {
            const { instance, getOverlayEmit } = createMockInstance();

            engine.syncFloats(instance, {}, { badge: { type: 'Badge' } });

            const emits = getOverlayEmit();
            expect(emits).toHaveBeenCalledTimes(1);
            const ctx = emits.mock.calls[0][0];
            expect(ctx.type).toBe(OVERLAY_ACTIONS.INIT);
        });

        it('移除 key 时发送 DISPOSE', () => {
            const { instance, getOverlayEmit } = createMockInstance();

            engine.syncFloats(instance, { badge: { type: 'Badge' } }, {});

            const emits = getOverlayEmit();
            expect(emits).toHaveBeenCalledTimes(1);
            const ctx = emits.mock.calls[0][0];
            expect(ctx.type).toBe(OVERLAY_ACTIONS.DISPOSE);
        });

        it('key 变更时先 DISPOSE 再 INIT', () => {
            const { instance, getOverlayEmit } = createMockInstance();

            engine.syncFloats(
                instance,
                {
                    badge: { type: 'Badge', data: { text: '1' } },
                },
                {
                    badge: { type: 'Badge', data: { text: '2' } },
                }
            );

            const emits = getOverlayEmit();
            expect(emits).toHaveBeenCalledTimes(2);
            expect(emits.mock.calls[0][0].type).toBe(OVERLAY_ACTIONS.DISPOSE);
            expect(emits.mock.calls[1][0].type).toBe(OVERLAY_ACTIONS.INIT);
        });

        it('key 未变更时不发送', () => {
            const { instance, getOverlayEmit } = createMockInstance();
            const decl = { type: 'Badge', data: { text: '1' } };

            engine.syncFloats(instance, { badge: decl }, { badge: decl });

            expect(getOverlayEmit()).not.toHaveBeenCalled();
        });

        it('混合变更（新增+移除+变更）', () => {
            const { instance, getOverlayEmit } = createMockInstance();

            engine.syncFloats(
                instance,
                {
                    badge: { type: 'Badge', data: { text: '1' } },
                    oldItem: { type: 'Menu' },
                },
                {
                    badge: { type: 'Badge', data: { text: '2' } },
                    newItem: { type: 'Tooltip' },
                }
            );

            const emits = getOverlayEmit();
            expect(emits).toHaveBeenCalledTimes(4);
        });
    });

    // ══════════════════════════════════════════════════════════════
    // FloatEngine — 控制操作
    // ══════════════════════════════════════════════════════════════

    describe('控制操作', () => {
        it('showFloat 发送 SHOW 事件', () => {
            const { instance, getOverlayEmit } = createMockInstance();

            engine.showFloat(instance, 'dropBtn');

            const ctx = getOverlayEmit().mock.calls[0][0];
            expect(ctx.type).toBe(OVERLAY_ACTIONS.SHOW);
            expect(ctx.source).toBe('comp-1:dropBtn');
        });

        it('hideFloat 发送 HIDE 事件', () => {
            const { instance, getOverlayEmit } = createMockInstance();

            engine.hideFloat(instance, 'dropBtn');

            const ctx = getOverlayEmit().mock.calls[0][0];
            expect(ctx.type).toBe(OVERLAY_ACTIONS.HIDE);
            expect(ctx.source).toBe('comp-1:dropBtn');
        });

        it('toggleFloat 发送 TOGGLE 事件', () => {
            const { instance, getOverlayEmit } = createMockInstance();

            engine.toggleFloat(instance, 'dropBtn');

            const ctx = getOverlayEmit().mock.calls[0][0];
            expect(ctx.type).toBe(OVERLAY_ACTIONS.TOGGLE);
            expect(ctx.source).toBe('comp-1:dropBtn');
        });

        it('updateFloat 发送 CHANGE 事件', () => {
            const { instance, getOverlayEmit } = createMockInstance();

            engine.updateFloat(instance, 'badge', { text: '5' });

            const ctx = getOverlayEmit().mock.calls[0][0];
            expect(ctx.type).toBe(OVERLAY_ACTIONS.CHANGE);
            expect(ctx.source).toBe('comp-1:badge');
            expect(ctx.data.data).toEqual({ text: '5' });
        });
    });

    // ══════════════════════════════════════════════════════════════
    // FloatAbility 委托验证
    // ══════════════════════════════════════════════════════════════

    describe('FloatAbility 委托', () => {
        it('_initFloatsFromProps 委托给 buildFromProps + floats setter', () => {
            const { instance, getCache } = createMockInstance();
            instance._initializing = true;
            instance.props = { tooltip: '保存' };

            FloatAbility._initFloatsFromProps.call(instance);

            expect(getCache().tooltip).toBeDefined();
            expect(getCache().tooltip.type).toBe('Tooltip');
        });

        it('_commitFloats 委托给 commitFloats', () => {
            const { instance, getOverlayEmit } = createMockInstance({
                tooltip: { type: 'Tooltip' },
            });

            FloatAbility._commitFloats.call(instance);

            expect(getOverlayEmit()).toHaveBeenCalledTimes(1);
        });

        it('showDialog 委托给 showFloat', () => {
            const { instance, getOverlayEmit } = createMockInstance();

            FloatAbility.showDialog.call(instance);

            const ctx = getOverlayEmit().mock.calls[0][0];
            expect(ctx.type).toBe(OVERLAY_ACTIONS.SHOW);
            expect(ctx.source).toBe('comp-1:dialog');
        });

        it('hideDialog 委托给 hideFloat', () => {
            const { instance, getOverlayEmit } = createMockInstance();

            FloatAbility.hideDialog.call(instance);

            const ctx = getOverlayEmit().mock.calls[0][0];
            expect(ctx.type).toBe(OVERLAY_ACTIONS.HIDE);
            expect(ctx.source).toBe('comp-1:dialog');
        });

        it('toggleDialog 委托给 toggleFloat', () => {
            const { instance, getOverlayEmit } = createMockInstance();

            FloatAbility.toggleDialog.call(instance);

            const ctx = getOverlayEmit().mock.calls[0][0];
            expect(ctx.type).toBe(OVERLAY_ACTIONS.TOGGLE);
            expect(ctx.source).toBe('comp-1:dialog');
        });

        it('updateDialog 委托给 updateFloat', () => {
            const { instance, getOverlayEmit } = createMockInstance();

            FloatAbility.updateDialog.call(instance, { title: '新标题' });

            const ctx = getOverlayEmit().mock.calls[0][0];
            expect(ctx.source).toBe('comp-1:dialog');
            expect(ctx.type).toBe(OVERLAY_ACTIONS.CHANGE);
            expect(ctx.data.data).toEqual({ title: '新标题' });
        });

        it('updateTooltip 委托给 updateFloat', () => {
            const { instance, getOverlayEmit } = createMockInstance();

            FloatAbility.updateTooltip.call(instance, { tooltip: '提示' });

            const ctx = getOverlayEmit().mock.calls[0][0];
            expect(ctx.source).toBe('comp-1:tooltip');
            expect(ctx.type).toBe(OVERLAY_ACTIONS.CHANGE);
        });

        it('floats getter returns engine cache', () => {
            const { instance, getCache } = createMockInstance();
            engine.setCache(instance, { badge: { type: 'Badge' } } as any);

            expect(instance.floats).toEqual(getCache());
        });

        it('floats setter delegates to engine', () => {
            const { instance, getCache } = createMockInstance();
            instance._initializing = true;

            instance.floats = { tooltip: { type: 'Tooltip' } } as any;

            expect(getCache().tooltip).toBeDefined();
        });

        it('attachFloat delegates to engine', () => {
            const { instance, getCache } = createMockInstance();
            instance._initializing = true;

            FloatAbility.attachFloat.call(instance, 'dropBtn', { type: 'Menu' } as any);

            expect(getCache().dropBtn).toBeDefined();
        });

        it('detachFloat delegates to engine', () => {
            const { instance, getCache } = createMockInstance({
                badge: { type: 'Badge' },
            });
            instance._initializing = true;

            FloatAbility.detachFloat.call(instance, 'badge');

            expect(getCache().badge).toBeUndefined();
        });

        it('showFloat delegates to engine', () => {
            const { instance, getOverlayEmit } = createMockInstance();

            FloatAbility.showFloat.call(instance, 'dropBtn');

            const ctx = getOverlayEmit().mock.calls[0][0];
            expect(ctx.type).toBe(OVERLAY_ACTIONS.SHOW);
        });

        it('hideFloat delegates to engine', () => {
            const { instance, getOverlayEmit } = createMockInstance();

            FloatAbility.hideFloat.call(instance, 'dropBtn');

            const ctx = getOverlayEmit().mock.calls[0][0];
            expect(ctx.type).toBe(OVERLAY_ACTIONS.HIDE);
        });

        it('toggleFloat delegates to engine', () => {
            const { instance, getOverlayEmit } = createMockInstance();

            FloatAbility.toggleFloat.call(instance, 'dropBtn');

            const ctx = getOverlayEmit().mock.calls[0][0];
            expect(ctx.type).toBe(OVERLAY_ACTIONS.TOGGLE);
        });

        it('updateFloat delegates to engine', () => {
            const { instance, getOverlayEmit } = createMockInstance();

            FloatAbility.updateFloat.call(instance, 'badge', { text: '5' });

            const ctx = getOverlayEmit().mock.calls[0][0];
            expect(ctx.type).toBe(OVERLAY_ACTIONS.CHANGE);
        });

        it('showLoading delegates to engine', () => {
            const { instance, getOverlayEmit } = createMockInstance();

            FloatAbility.showLoading.call(instance, '加载中', 'scoped');

            const calls = getOverlayEmit().mock.calls;
            const lastCtx = calls[calls.length - 1][0];
            expect(lastCtx.type).toBe(OVERLAY_ACTIONS.SHOW);
            expect(lastCtx.source).toBe('comp-1:loading');
        });

        it('hideLoading delegates to engine', () => {
            const { instance, getOverlayEmit } = createMockInstance();

            FloatAbility.hideLoading.call(instance);

            const ctx = getOverlayEmit().mock.calls[0][0];
            expect(ctx.type).toBe(OVERLAY_ACTIONS.HIDE);
        });

        it('updateLoading delegates to engine', () => {
            const { instance, getOverlayEmit } = createMockInstance();

            FloatAbility.updateLoading.call(instance, { text: '更新中' });

            const ctx = getOverlayEmit().mock.calls[0][0];
            expect(ctx.type).toBe(OVERLAY_ACTIONS.CHANGE);
        });

        it('初始化阶段 setter 合并缓存不触发 diff', () => {
            const { instance, getCache, getOverlayEmit } = createMockInstance({
                existing: { type: 'Existing' },
            });
            instance._initializing = true;
            instance.props = { tooltip: '保存' };

            FloatAbility._initFloatsFromProps.call(instance);

            expect(getCache().existing).toBeDefined();
            expect(getCache().tooltip).toBeDefined();
            expect(getOverlayEmit()).not.toHaveBeenCalled();
        });
    });
});
