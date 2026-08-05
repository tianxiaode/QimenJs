/**
 * LocalListAbility 单元测试
 *
 * 覆盖：
 * 1. list / refresh / filter / sort
 * 2. refresh 不 await list
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

import { ComposableBase } from '@/composable/ComposableBase';
import { withAbilities } from '@/composable';
import { LocalListAbility } from '@/entity/abilities/local/LocalListAbility';
import { ENTITY_LIST_EVENTS } from '@/events';

function createListHost() {
    class ListHost extends ComposableBase {
        items: any[] = [];
        search: any = {};

        buildOptions = jest.fn().mockResolvedValue({});
        fetch = jest.fn().mockResolvedValue({ data: { list: [{ id: '1', name: 'test' }] } });
        updateData = jest.fn().mockResolvedValue(undefined);
        toParams = jest.fn().mockReturnValue({});
        emit = jest.fn();
        emitEvent = jest.fn();
    }
    withAbilities(ListHost, [LocalListAbility]);
    return new ListHost() as any;
}

describe('LocalListAbility', () => {
    it('list 应调用 buildOptions、fetch、updateData', async () => {
        const host = createListHost();

        const result = await host.list();

        expect(host.buildOptions).toHaveBeenCalledWith('list', {}, null, {});
        expect(host.fetch).toHaveBeenCalledWith('list', {});
        expect(host.updateData).toHaveBeenCalledWith([{ id: '1', name: 'test' }]);
        expect(host.emitEvent).toHaveBeenCalledWith(ENTITY_LIST_EVENTS.LISTED, host.items);
        expect(result).toBe(host.items);
        host.dispose();
    });

    it('list 当 data.list 为空时应传入空数组', async () => {
        const host = createListHost();
        host.fetch.mockResolvedValueOnce({ data: {} });

        await host.list();

        expect(host.updateData).toHaveBeenCalledWith([]);
        host.dispose();
    });

    it('refresh 应调用 list（不 await）', () => {
        const host = createListHost();
        const listSpy = jest.spyOn(host, 'list').mockResolvedValue([]);

        host.refresh();

        expect(listSpy).toHaveBeenCalled();
        host.dispose();
    });

    it('filter 应设置 search.keyword 并调用 list', async () => {
        const host = createListHost();
        host.items = [{ id: '1', name: 'test' }];
        const listSpy = jest.spyOn(host, 'list').mockResolvedValue(host.items);

        await host.filter('keyword');

        expect(host.search.keyword).toBe('keyword');
        expect(listSpy).toHaveBeenCalled();
        host.dispose();
    });

    it('sort 应设置 search.sortBy 和 sortOrder 并调用 list', async () => {
        const host = createListHost();
        host.items = [{ id: '1', name: 'test' }];
        const listSpy = jest.spyOn(host, 'list').mockResolvedValue(host.items);

        await host.sort('name', 'desc');

        expect(host.search.sortBy).toBe('name');
        expect(host.search.sortOrder).toBe('desc');
        expect(listSpy).toHaveBeenCalled();
        host.dispose();
    });
});
