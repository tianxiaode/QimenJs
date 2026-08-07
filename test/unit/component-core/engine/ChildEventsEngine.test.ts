import { ChildEventsEngine } from '@/component-core/engine/ChildEventsEngine';
import { ListensEngine } from '@/component-core/engine/ListensEngine';
import { EventForwarder } from '@/component-core/engine/EventForwarder';

jest.mock('@/component-core/engine/ListensEngine', () => ({
    ListensEngine: {
        bindNodeEvents: jest.fn(),
        extractNodeEvents: jest.fn(() => []),
    },
}));

jest.mock('@/component-core/engine/EventForwarder', () => ({
    EventForwarder: {
        forward: jest.fn(),
        resolveKey: jest.fn((key: any) => (typeof key === 'string' ? key : key?.key)),
    },
}));

describe('ChildEventsEngine', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('bindChildEvents — 向后兼容', () => {
        it('将 string[] 简写转换为新格式并委托给 ListensEngine', () => {
            const instance: any = {
                nodeMap: { toolbar: { component: {} } },
                onCleanup: jest.fn(),
            };

            ChildEventsEngine.bindChildEvents(instance, { toolbar: ['save', 'create'] });

            expect(ListensEngine.bindNodeEvents).toHaveBeenCalledWith(instance, [
                { node: 'toolbar', events: { save: true, create: true } },
            ]);
        });

        it('将详细配置转换为新格式并委托', () => {
            const instance: any = {
                nodeMap: { toolbar: { component: {} } },
                onCleanup: jest.fn(),
            };

            ChildEventsEngine.bindChildEvents(instance, {
                toolbar: { save: { handler: true, emits: ['saved'] } },
            });

            expect(ListensEngine.bindNodeEvents).toHaveBeenCalledWith(instance, [
                { node: 'toolbar', events: { save: { handler: true, emits: ['saved'] } } },
            ]);
        });

        it('空 childEvents 对象仍然委托（交给 ListensEngine 处理）', () => {
            const instance: any = { nodeMap: {}, onCleanup: jest.fn() };
            ChildEventsEngine.bindChildEvents(instance, {});
            expect(ListensEngine.bindNodeEvents).toHaveBeenCalledWith(instance, []);
        });
    });

    describe('extractChildEvents — 向后兼容', () => {
        it('从 listens 数组提取 node 配置', () => {
            (ListensEngine.extractNodeEvents as any).mockReturnValueOnce([
                { node: 'toolbar', events: { save: true } },
            ]);

            const result = ChildEventsEngine.extractChildEvents([
                { node: 'toolbar', events: { save: true } },
            ]);
            expect(result).toEqual({ toolbar: { save: true } });
        });

        it('无 node 时返回 null', () => {
            (ListensEngine.extractNodeEvents as any).mockReturnValueOnce([]);
            expect(ChildEventsEngine.extractChildEvents([{ source: 'x', events: {} }])).toBeNull();
        });

        it('空数组返回 null', () => {
            (ListensEngine.extractNodeEvents as any).mockReturnValueOnce([]);
            expect(ChildEventsEngine.extractChildEvents([])).toBeNull();
        });
    });
});
