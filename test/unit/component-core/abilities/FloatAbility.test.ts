import { FloatAbility } from '@/component-core/abilities/FloatAbility';
import { OVERLAY_ACTIONS } from '@/events/overlay-events';

describe('FloatAbility', () => {
    describe('attachFloat', () => {
        it('通过 floats setter 追加浮层配置', () => {
            const floatsSetter = jest.fn();
            const instance = {
                _floatsCache: undefined as any,
                get floats() {
                    return instance._floatsCache;
                },
                set floats(val: any) {
                    floatsSetter(val);
                },
            };

            FloatAbility.attachFloat.call(instance, 'dropBtn', {
                type: 'Menu',
                trigger: 'click',
            } as any);

            expect(floatsSetter).toHaveBeenCalledTimes(1);
            const calledWith = floatsSetter.mock.calls[0][0];
            expect(calledWith.dropBtn).toEqual({ type: 'Menu', trigger: 'click' });
        });

        it('追加到已有缓存', () => {
            const floatsSetter = jest.fn();
            const instance = {
                _floatsCache: { badge: { type: 'Badge' } },
                get floats() {
                    return instance._floatsCache;
                },
                set floats(val: any) {
                    floatsSetter(val);
                },
            };

            FloatAbility.attachFloat.call(instance, 'dropBtn', { type: 'Menu' } as any);

            const calledWith = floatsSetter.mock.calls[0][0];
            expect(calledWith.badge).toEqual({ type: 'Badge' });
            expect(calledWith.dropBtn).toEqual({ type: 'Menu' });
        });
    });

    describe('detachFloat', () => {
        it('从缓存中移除指定 key', () => {
            const floatsSetter = jest.fn();
            const instance = {
                _floatsCache: {
                    badge: { type: 'Badge' },
                    dropBtn: { type: 'Menu' },
                },
                set floats(val: any) {
                    floatsSetter(val);
                },
            };

            FloatAbility.detachFloat.call(instance, 'dropBtn');

            const calledWith = floatsSetter.mock.calls[0][0];
            expect(calledWith.badge).toEqual({ type: 'Badge' });
            expect(calledWith.dropBtn).toBeUndefined();
        });

        it('key 不存在时不调用 setter', () => {
            const floatsSetter = jest.fn();
            const instance = {
                _floatsCache: { badge: { type: 'Badge' } },
                set floats(val: any) {
                    floatsSetter(val);
                },
            };

            FloatAbility.detachFloat.call(instance, 'nonExist');

            expect(floatsSetter).not.toHaveBeenCalled();
        });

        it('移除最后一个 key 时设为 undefined', () => {
            const floatsSetter = jest.fn();
            const instance = {
                _floatsCache: { badge: { type: 'Badge' } },
                set floats(val: any) {
                    floatsSetter(val);
                },
            };

            FloatAbility.detachFloat.call(instance, 'badge');

            expect(floatsSetter).toHaveBeenCalledWith(undefined);
        });
    });

    describe('showFloat', () => {
        it('发送 SHOW 事件', () => {
            const overlayEmit = jest.fn();
            const instance = { id: 'btn-1', overlayEmit };

            FloatAbility.showFloat.call(instance, 'dropBtn');

            expect(overlayEmit).toHaveBeenCalledTimes(1);
            const ctx = overlayEmit.mock.calls[0][0];
            expect(ctx.type).toBe(OVERLAY_ACTIONS.SHOW);
            expect(ctx.source).toBe('btn-1:dropBtn');
        });
    });

    describe('hideFloat', () => {
        it('发送 HIDE 事件', () => {
            const overlayEmit = jest.fn();
            const instance = { id: 'btn-1', overlayEmit };

            FloatAbility.hideFloat.call(instance, 'dropBtn');

            expect(overlayEmit).toHaveBeenCalledTimes(1);
            const ctx = overlayEmit.mock.calls[0][0];
            expect(ctx.type).toBe(OVERLAY_ACTIONS.HIDE);
            expect(ctx.source).toBe('btn-1:dropBtn');
        });
    });

    describe('toggleFloat', () => {
        it('发送 TOGGLE 事件', () => {
            const overlayEmit = jest.fn();
            const instance = { id: 'btn-1', overlayEmit };

            FloatAbility.toggleFloat.call(instance, 'dropBtn');

            expect(overlayEmit).toHaveBeenCalledTimes(1);
            const ctx = overlayEmit.mock.calls[0][0];
            expect(ctx.type).toBe(OVERLAY_ACTIONS.TOGGLE);
            expect(ctx.source).toBe('btn-1:dropBtn');
        });
    });

    describe('updateFloat', () => {
        it('发送 CHANGE 事件', () => {
            const overlayEmit = jest.fn();
            const instance = { id: 'btn-1', overlayEmit };

            FloatAbility.updateFloat.call(instance, 'badge', { text: '5' });

            expect(overlayEmit).toHaveBeenCalledTimes(1);
            const ctx = overlayEmit.mock.calls[0][0];
            expect(ctx.type).toBe(OVERLAY_ACTIONS.CHANGE);
            expect(ctx.source).toBe('btn-1:badge');
            expect(ctx.data.data).toEqual({ text: '5' });
            expect(ctx.data.component.id).toBe('btn-1');
        });
    });

    describe('updateBadge', () => {
        it('委托 updateFloat 发送 badge CHANGE 事件', () => {
            const overlayEmit = jest.fn();
            const instance = { id: 'btn-1', overlayEmit, updateFloat: FloatAbility.updateFloat };

            FloatAbility.updateBadge.call(instance, { text: '5' });

            expect(overlayEmit).toHaveBeenCalledTimes(1);
            const ctx = overlayEmit.mock.calls[0][0];
            expect(ctx.source).toBe('btn-1:badge');
            expect(ctx.type).toBe(OVERLAY_ACTIONS.CHANGE);
            expect(ctx.data.data).toEqual({ text: '5' });
        });

        it('visible 控制显隐', () => {
            const overlayEmit = jest.fn();
            const instance = { id: 'btn-2', overlayEmit, updateFloat: FloatAbility.updateFloat };

            FloatAbility.updateBadge.call(instance, { visible: false });

            const ctx = overlayEmit.mock.calls[0][0];
            expect(ctx.data.data).toEqual({ visible: false });
        });
    });

    describe('updateTooltip', () => {
        it('委托 updateFloat 发送 tooltip CHANGE 事件', () => {
            const overlayEmit = jest.fn();
            const instance = { id: 'input-1', overlayEmit, updateFloat: FloatAbility.updateFloat };

            FloatAbility.updateTooltip.call(instance, { tooltip: '提示文本' });

            expect(overlayEmit).toHaveBeenCalledTimes(1);
            const ctx = overlayEmit.mock.calls[0][0];
            expect(ctx.source).toBe('input-1:tooltip');
            expect(ctx.type).toBe(OVERLAY_ACTIONS.CHANGE);
            expect(ctx.data.data).toEqual({ tooltip: '提示文本' });
        });

        it('visible 控制显隐', () => {
            const overlayEmit = jest.fn();
            const instance = { id: 'input-2', overlayEmit, updateFloat: FloatAbility.updateFloat };

            FloatAbility.updateTooltip.call(instance, { visible: true });

            const ctx = overlayEmit.mock.calls[0][0];
            expect(ctx.data.data).toEqual({ visible: true });
        });
    });
});
