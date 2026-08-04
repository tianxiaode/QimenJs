import { ComponentEntityDispatch, ACTION_PAIRS } from '@/component-core/engine/ComponentEntityDispatch';

describe('ComponentEntityDispatch', () => {
    describe('ACTION_PAIRS', () => {
        test('所有 action 都有 success/error/loading', () => {
            for (const [action, pair] of Object.entries(ACTION_PAIRS)) {
                expect(pair.success).toBeDefined();
                expect(pair.error).toBeDefined();
                expect(pair.loading).toBeDefined();
                expect(pair.error).toBe(`${action}:error`);
                expect(pair.loading).toBe(`${action}:loading`);
            }
        });

        test('列表类操作 success 为 listed', () => {
            const listedActions = ['list', 'getAll', 'filter', 'sort', 'refresh', 'searchBy', 'reset', 'prev', 'next', 'jump', 'changeSize', 'expand', 'collapse'];
            for (const action of listedActions) {
                expect(ACTION_PAIRS[action].success).toBe('listed');
            }
        });

        test('CRUD 操作 success 为过去式', () => {
            expect(ACTION_PAIRS.create.success).toBe('created');
            expect(ACTION_PAIRS.update.success).toBe('updated');
            expect(ACTION_PAIRS.delete.success).toBe('deleted');
            expect(ACTION_PAIRS.toggle.success).toBe('toggled');
            expect(ACTION_PAIRS.save.success).toBe('saved');
            expect(ACTION_PAIRS.get.success).toBe('got');
            expect(ACTION_PAIRS.connect.success).toBe('connected');
        });
    });

    describe('dispatch', () => {
        let instance: any;
        let offFns: jest.Mock[];

        beforeEach(() => {
            offFns = [jest.fn(), jest.fn(), jest.fn()];
            instance = {
                entityOn: jest.fn().mockReturnValueOnce(offFns[0]).mockReturnValueOnce(offFns[1]).mockReturnValueOnce(offFns[2]),
                entityEmit: jest.fn(),
                onEntityActionSuccess: jest.fn(),
                onEntityError: jest.fn(),
                onEntityLoading: jest.fn(),
                domain: 'test',
                logger: { warn: jest.fn() },
            };
        });

        test('未知 action 应 warn 并返回', () => {
            ComponentEntityDispatch.dispatch(instance, 'entity1', 'unknown');
            expect(instance.logger.warn).toHaveBeenCalled();
            expect(instance.entityEmit).not.toHaveBeenCalled();
        });

        test('应订阅 loading/success/error 三事件', () => {
            ComponentEntityDispatch.dispatch(instance, 'entity1', 'list', { q: 'test' });
            expect(instance.entityOn).toHaveBeenCalledTimes(3);
            expect(instance.entityOn).toHaveBeenCalledWith('entity1', 'list:loading', expect.any(Function));
            expect(instance.entityOn).toHaveBeenCalledWith('entity1', 'listed', expect.any(Function));
            expect(instance.entityOn).toHaveBeenCalledWith('entity1', 'list:error', expect.any(Function));
        });

        test('应发射 entityEmit', () => {
            ComponentEntityDispatch.dispatch(instance, 'entity1', 'list', { q: 'test' });
            expect(instance.entityEmit).toHaveBeenCalledWith({
                event: 'list',
                type: 'list',
                source: 'entity1',
                data: { q: 'test' },
            });
        });

        test('loading 回调应触发 onEntityLoading(true)', () => {
            ComponentEntityDispatch.dispatch(instance, 'entity1', 'list');
            const loadingCb = instance.entityOn.mock.calls[0][2];
            loadingCb();
            expect(instance.onEntityLoading).toHaveBeenCalledWith('entity1', true);
        });

        test('success 回调应 cleanup + onEntityLoading(false) + onEntityActionSuccess', () => {
            ComponentEntityDispatch.dispatch(instance, 'entity1', 'list');
            const successCb = instance.entityOn.mock.calls[1][2];
            successCb({ items: [] });
            expect(offFns[0]).toHaveBeenCalled();
            expect(offFns[1]).toHaveBeenCalled();
            expect(offFns[2]).toHaveBeenCalled();
            expect(instance.onEntityLoading).toHaveBeenCalledWith('entity1', false);
            expect(instance.onEntityActionSuccess).toHaveBeenCalledWith({ items: [] }, 'list', 'entity1');
        });

        test('error 回调应 cleanup + onEntityLoading(false) + onEntityError', () => {
            ComponentEntityDispatch.dispatch(instance, 'entity1', 'list');
            const errorCb = instance.entityOn.mock.calls[2][2];
            const errCtx = { error: { code: 'NETWORK_ERROR' } };
            errorCb(errCtx);
            expect(offFns[0]).toHaveBeenCalled();
            expect(offFns[1]).toHaveBeenCalled();
            expect(offFns[2]).toHaveBeenCalled();
            expect(instance.onEntityLoading).toHaveBeenCalledWith('entity1', false);
            expect(instance.onEntityError).toHaveBeenCalledWith(errCtx, 'test');
        });

        test('success 后 cleanup 应已释放所有 handler', () => {
            ComponentEntityDispatch.dispatch(instance, 'entity1', 'list');
            const successCb = instance.entityOn.mock.calls[1][2];
            successCb({ items: [] });
            expect(offFns[0]).toHaveBeenCalled();
            expect(offFns[1]).toHaveBeenCalled();
            expect(offFns[2]).toHaveBeenCalled();
        });
    });
});