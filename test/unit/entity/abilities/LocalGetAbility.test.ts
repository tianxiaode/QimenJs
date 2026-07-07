/**
 * LocalGetAbility 单元测试
 *
 * 覆盖：
 * 1. idField 为 'id' 时直接从 sourceData 查找
 * 2. idField 非 'id' 时遍历查找
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
import { LocalGetAbility } from '@/entity/abilities/local/LocalGetAbility';
import { ENTITY_LIST_EVENTS } from '@/events';

function createGetHost(idField: string = 'id') {
    class GetHost extends ComposableBase {
        static readonly abilities = [LocalGetAbility];
        compiledSchema = { idField };
        sourceData = new Map<string, any>();
        item: any = null;
        emit = jest.fn();
    }
    return new GetHost() as any;
}

describe('LocalGetAbility', () => {
    it('idField 为 id 时应直接从 sourceData 查找', () => {
        const host = createGetHost();
        host.sourceData.set('1', { id: '1', name: 'test' });

        const result = host.get('1');

        expect(result).toEqual({ id: '1', name: 'test' });
        expect(host.item).toEqual({ id: '1', name: 'test' });
        expect(host.emit).toHaveBeenCalledWith(ENTITY_LIST_EVENTS.GOT, result);
        host.dispose();
    });

    it('idField 为 id 且找不到时应返回 null', () => {
        const host = createGetHost();

        const result = host.get('nonexistent');

        expect(result).toBeNull();
        expect(host.item).toBeNull();
        host.dispose();
    });

    it('idField 非 id 时应遍历查找', () => {
        const host = createGetHost('code');
        host.sourceData.set('1', { code: 'ABC', name: 'test' });

        const result = host.get('ABC');

        expect(result).toEqual({ code: 'ABC', name: 'test' });
        expect(host.item).toEqual({ code: 'ABC', name: 'test' });
        host.dispose();
    });

    it('idField 非 id 且遍历找不到时应返回 null', () => {
        const host = createGetHost('code');
        host.sourceData.set('1', { code: 'XYZ', name: 'test' });

        const result = host.get('ABC');

        expect(result).toBeNull();
        expect(host.item).toBeNull();
        host.dispose();
    });
});
