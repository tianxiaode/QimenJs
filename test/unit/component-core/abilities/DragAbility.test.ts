import { DragAbility } from '@/component-core/abilities/DragAbility';

jest.mock('@/events', () => ({
    DragEventBus: {
        getInstance: jest.fn(() => ({
            dragStart: jest.fn(),
            dragEnd: jest.fn(),
        })),
    },
}));

describe('DragAbility', () => {
    it('提供 _initDrags 方法', () => {
        expect(typeof DragAbility._initDrags).toBe('function');
    });

    it('无 drags 配置时 _initDrags 不报错', () => {
        const instance = { constructor: {} };
        expect(() => DragAbility._initDrags.call(instance)).not.toThrow();
    });

    it('有 drags 配置时调用 _setupDragOnNode', () => {
        const setupSpy = jest.fn();
        const el = document.createElement('div');
        const instance = {
            constructor: { _drags: { handle: { axis: 'y' } } },
            _resolveNodeEl: jest.fn(() => el),
            _setupDragOnNode: setupSpy,
        };
        DragAbility._initDrags.call(instance);
        expect(setupSpy).toHaveBeenCalledWith('handle', el, { axis: 'y' });
    });
});
