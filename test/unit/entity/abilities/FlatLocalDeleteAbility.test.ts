/**
 * FlatLocalDeleteAbility 单元测试
 *
 * 覆盖：delete
 */

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

jest.mock('@/cache', () => ({
    CacheFactory: {
        create: jest.fn().mockResolvedValue({
            id: 'test-provider',
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
            remove: jest.fn().mockResolvedValue(undefined),
        }),
        release: jest.fn(),
    },
}));

import { ComposableBase } from '@/composable/ComposableBase';
import { withAbilities } from '@/composable';
import { FlatLocalDeleteAbility } from '@/entity/abilities/local/FlatLocalDeleteAbility';
import { ENTITY_CRUD_EVENTS } from '@/events';

function createHost() {
    class TestHost extends ComposableBase {
        schema = { idField: 'id', idType: 'string', nameField: 'name', domain: 'test' };
        sourceData = new Map<string, any>();
        items: any[] = [];
        emit = jest.fn();
        fetch = jest.fn().mockResolvedValue(undefined);
        getDeletionPlan = jest.fn().mockReturnValue({ localOnly: [], persistent: [] });
        softDelete = jest.fn().mockResolvedValue(undefined);
        buildOptions = jest.fn().mockResolvedValue({});
        confirmDelete = jest.fn().mockResolvedValue(undefined);
        refreshView = jest.fn();
    }
    withAbilities(TestHost, [FlatLocalDeleteAbility]);
    return new TestHost() as any;
}

describe('FlatLocalDeleteAbility', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('delete', () => {
        it('调用 getDeletionPlan -> softDelete -> confirmDelete', async () => {
            const host = createHost();
            const ids = ['1', '2'];
            await host.delete(ids);
            expect(host.getDeletionPlan).toHaveBeenCalledWith(ids);
            expect(host.softDelete).toHaveBeenCalled();
            expect(host.confirmDelete).toHaveBeenCalled();
        });

        it('触发 DELETED 事件', async () => {
            const host = createHost();
            const ids = ['1'];
            await host.delete(ids);
            expect(host.emit).toHaveBeenCalledWith(ENTITY_CRUD_EVENTS.DELETED, ids);
        });

        it('调用 refreshView', async () => {
            const host = createHost();
            await host.delete(['1']);
            expect(host.refreshView).toHaveBeenCalled();
        });

        it('persistent + immediate 时调用 fetch', async () => {
            const host = createHost();
            host.getDeletionPlan.mockReturnValue({ localOnly: [], persistent: ['1'] });
            await host.delete(['1'], true);
            expect(host.fetch).toHaveBeenCalledWith('delete', expect.anything());
        });

        it('persistent + !immediate 时不调用 fetch', async () => {
            const host = createHost();
            host.getDeletionPlan.mockReturnValue({ localOnly: [], persistent: ['1'] });
            await host.delete(['1'], false);
            expect(host.fetch).not.toHaveBeenCalled();
        });

        it('返回 plan', async () => {
            const host = createHost();
            const plan = { localOnly: ['1'], persistent: [] };
            host.getDeletionPlan.mockReturnValue(plan);
            const result = await host.delete(['1']);
            expect(result).toEqual(plan);
        });
    });
});
