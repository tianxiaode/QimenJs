import { OverlayUpdateAbility } from '@/component-core/abilities/OverlayUpdateAbility';
import { OVERLAY_ACTIONS } from '@/events/overlay-events';

describe('OverlayUpdateAbility', () => {
    describe('updateBadge', () => {
        it('通过 overlayEmit 发送 badge CHANGE 事件', () => {
            const overlayEmit = jest.fn();
            const instance = { id: 'btn-1', overlayEmit };

            OverlayUpdateAbility.updateBadge.call(instance, { text: '5' });

            expect(overlayEmit).toHaveBeenCalledTimes(1);
            const ctx = overlayEmit.mock.calls[0][0];
            expect(ctx.source).toBe('btn-1:badge');
            expect(ctx.type).toBe(OVERLAY_ACTIONS.CHANGE);
            expect(ctx.data.data).toEqual({ text: '5' });
            expect(ctx.data.component.id).toBe('btn-1');
        });

        it('visible 控制显隐', () => {
            const overlayEmit = jest.fn();
            const instance = { id: 'btn-2', overlayEmit };

            OverlayUpdateAbility.updateBadge.call(instance, { visible: false });

            const ctx = overlayEmit.mock.calls[0][0];
            expect(ctx.source).toBe('btn-2:badge');
            expect(ctx.data.data).toEqual({ visible: false });
        });
    });

    describe('updateTooltip', () => {
        it('通过 overlayEmit 发送 tooltip CHANGE 事件', () => {
            const overlayEmit = jest.fn();
            const instance = { id: 'input-1', overlayEmit };

            OverlayUpdateAbility.updateTooltip.call(instance, { tooltip: '提示文本' });

            expect(overlayEmit).toHaveBeenCalledTimes(1);
            const ctx = overlayEmit.mock.calls[0][0];
            expect(ctx.source).toBe('input-1:tooltip');
            expect(ctx.type).toBe(OVERLAY_ACTIONS.CHANGE);
            expect(ctx.data.data).toEqual({ tooltip: '提示文本' });
            expect(ctx.data.component.id).toBe('input-1');
        });

        it('visible 控制显隐', () => {
            const overlayEmit = jest.fn();
            const instance = { id: 'input-2', overlayEmit };

            OverlayUpdateAbility.updateTooltip.call(instance, { visible: true });

            const ctx = overlayEmit.mock.calls[0][0];
            expect(ctx.source).toBe('input-2:tooltip');
            expect(ctx.data.data).toEqual({ visible: true });
        });
    });
});
