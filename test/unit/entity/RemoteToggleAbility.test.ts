/**
 * RemoteToggleAbility 单元测试
 *
 * 覆盖分支：
 * - _internalToggle: context.data.item 存在时使用 finalData
 * - _internalToggle: context.data.item 不存在时使用原始 item
 * - _internalToggle: 成功路径
 * - _internalToggle: 失败回滚路径
 */

import { ComposableBase } from '@/composable';
import { RemoteToggleAbility } from '@/entity/abilities/remote/RemoteToggleAbility';
import { ENTITY_CRUD_EVENTS } from '@/events';

class TestToggleHost extends ComposableBase.with([RemoteToggleAbility]) {
    idField = 'id';
    item: any = null;
    items: any[] = [];
    buildOptions = jest.fn();
    fetch = jest.fn();
    updateItem = jest.fn((item: any) => {
        this.item = item;
        this.items = [item];
    });
    emit = jest.fn();
}

describe('RemoteToggleAbility', () => {
    let host: TestToggleHost;

    beforeEach(() => {
        host = new TestToggleHost();
    });

    afterEach(() => {
        host.dispose();
    });

    describe('_internalToggle', () => {
        it('fetch 返回 context.data.item 存在时应使用 finalData', async () => {
            const item = { id: 1, enabled: false };
            const finalData = { id: 1, enabled: true, updatedAt: '2024-01-01' };

            host.fetch.mockResolvedValue({
                data: { item: finalData, list: [], total: 0 },
            });

            await (host as any)._internalToggle(item, 'enabled');

            expect(host.updateItem).toHaveBeenCalledWith(finalData);
            expect(host.emit).toHaveBeenCalledWith(ENTITY_CRUD_EVENTS.TOGGLED, {
                id: 1,
                item: finalData,
                field: 'enabled',
            });
        });

        it('fetch 返回 context.data.item 不存在时应使用原始 item', async () => {
            const item = { id: 1, enabled: false };

            host.fetch.mockResolvedValue({
                data: { item: null, list: [], total: 0 },
            });

            await (host as any)._internalToggle(item, 'enabled');

            // item.enabled should have been toggled to true
            expect(item.enabled).toBe(true);
            expect(host.updateItem).toHaveBeenCalledWith(item);
            expect(host.emit).toHaveBeenCalledWith(ENTITY_CRUD_EVENTS.TOGGLED, {
                id: 1,
                item: item,
                field: 'enabled',
            });
        });

        it('fetch 返回 context.data.item 为 undefined 时应使用原始 item', async () => {
            const item = { id: 1, enabled: false };

            host.fetch.mockResolvedValue({
                data: { item: undefined, list: [], total: 0 },
            });

            await (host as any)._internalToggle(item, 'enabled');

            expect(item.enabled).toBe(true);
            expect(host.updateItem).toHaveBeenCalledWith(item);
        });

        it('乐观更新应立即翻转字段值', async () => {
            const item = { id: 1, enabled: false };

            host.fetch.mockImplementation(async () => {
                // At this point, the item should already be toggled
                expect(item.enabled).toBe(true);
                return { data: { item: { ...item }, list: [], total: 0 } };
            });

            await (host as any)._internalToggle(item, 'enabled');
        });

        it('fetch 失败时应回滚到旧值', async () => {
            const item = { id: 1, enabled: false };

            host.fetch.mockRejectedValue(new Error('Network error'));

            await (host as any)._internalToggle(item, 'enabled');

            expect(item.enabled).toBe(false);
            expect(host.updateItem).toHaveBeenCalledWith(item);
        });

        it('fetch 失败时不应发射 toggled 事件', async () => {
            const item = { id: 1, enabled: false };

            host.fetch.mockRejectedValue(new Error('Network error'));

            await (host as any)._internalToggle(item, 'enabled');

            expect(host.emit).not.toHaveBeenCalledWith(
                ENTITY_CRUD_EVENTS.TOGGLED,
                expect.anything()
            );
        });

        it('从 true 切换到 false 失败时应回滚到 true', async () => {
            const item = { id: 1, enabled: true };

            host.fetch.mockRejectedValue(new Error('Server error'));

            await (host as any)._internalToggle(item, 'enabled');

            expect(item.enabled).toBe(true);
        });
    });
});
