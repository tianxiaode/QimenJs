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
import { SchemaProxyAbility } from '@/entity/abilities/core/SchemaProxyAbility';

function createHost(schema?: any) {
    class TestHost extends ComposableBase {
        schema = schema ?? { idField: 'id', idType: 'number', nameField: 'name' };
    }
    const proto = TestHost.prototype as any;
    for (const key of Object.keys(SchemaProxyAbility)) {
        const desc = (SchemaProxyAbility as any)[key];
        if (desc && typeof desc === 'object' && 'get' in desc) {
            Object.defineProperty(proto, key, {
                get: desc.get,
                configurable: true,
                enumerable: desc.enumerable ?? true,
            });
        }
    }
    return new TestHost() as any;
}

describe('SchemaProxyAbility', () => {
    describe('非树形 schema', () => {
        it('idField 返回 schema.idField', () => {
            const host = createHost();
            expect(host.idField).toBe('id');
        });

        it('idType 返回 schema.idType', () => {
            const host = createHost();
            expect(host.idType).toBe('number');
        });

        it('nameField 返回 schema.nameField', () => {
            const host = createHost();
            expect(host.nameField).toBe('name');
        });

        it('defaultSort 默认空字符串', () => {
            const host = createHost();
            expect(host.defaultSort).toBe('');
        });

        it('defaultOrder 默认 asc', () => {
            const host = createHost();
            expect(host.defaultOrder).toBe('asc');
        });

        it('searchFields 默认空数组', () => {
            const host = createHost();
            expect(host.searchFields).toEqual([]);
        });

        it('isTree 返回 false', () => {
            const host = createHost();
            expect(host.isTree).toBe(false);
        });

        it('isLazy 非树形返回 false', () => {
            const host = createHost();
            expect(host.isLazy).toBe(false);
        });

        it('root 非树形返回空字符串', () => {
            const host = createHost();
            expect(host.root).toBe('');
        });

        it('parentIdField 非树形返回空字符串', () => {
            const host = createHost();
            expect(host.parentIdField).toBe('');
        });

        it('childrenField 非树形返回空字符串', () => {
            const host = createHost();
            expect(host.childrenField).toBe('');
        });

        it('pathField 非树形返回空字符串', () => {
            const host = createHost();
            expect(host.pathField).toBe('');
        });

        it('leafField 非树形返回空字符串', () => {
            const host = createHost();
            expect(host.leafField).toBe('');
        });

        it('expandedField 非树形返回空字符串', () => {
            const host = createHost();
            expect(host.expandedField).toBe('');
        });

        it('useFlat 非树形返回 false', () => {
            const host = createHost();
            expect(host.useFlat).toBe(false);
        });
    });

    describe('树形 schema', () => {
        const treeSchema = {
            idField: 'id',
            idType: 'string',
            nameField: 'name',
            isTree: true,
            isLazy: true,
            root: 'root-id',
            parentIdField: 'parentId',
            childrenField: 'children',
            pathField: 'path',
            leafField: 'isLeaf',
            expandedField: 'expanded',
            useFlat: true,
        };

        it('isTree 返回 true', () => {
            const host = createHost(treeSchema);
            expect(host.isTree).toBe(true);
        });

        it('isLazy 返回 schema.isLazy', () => {
            const host = createHost(treeSchema);
            expect(host.isLazy).toBe(true);
        });

        it('root 返回 schema.root', () => {
            const host = createHost(treeSchema);
            expect(host.root).toBe('root-id');
        });

        it('parentIdField 返回 schema.parentIdField', () => {
            const host = createHost(treeSchema);
            expect(host.parentIdField).toBe('parentId');
        });

        it('childrenField 返回 schema.childrenField', () => {
            const host = createHost(treeSchema);
            expect(host.childrenField).toBe('children');
        });

        it('pathField 返回 schema.pathField', () => {
            const host = createHost(treeSchema);
            expect(host.pathField).toBe('path');
        });

        it('leafField 返回 schema.leafField', () => {
            const host = createHost(treeSchema);
            expect(host.leafField).toBe('isLeaf');
        });

        it('expandedField 返回 schema.expandedField', () => {
            const host = createHost(treeSchema);
            expect(host.expandedField).toBe('expanded');
        });

        it('useFlat 返回 schema.useFlat', () => {
            const host = createHost(treeSchema);
            expect(host.useFlat).toBe(true);
        });
    });

    describe('无 schema', () => {
        it('idField 默认 id', () => {
            const host = createHost(null);
            expect(host.idField).toBe('id');
        });

        it('idType 默认 number', () => {
            const host = createHost(null);
            expect(host.idType).toBe('number');
        });

        it('nameField 默认 name', () => {
            const host = createHost(null);
            expect(host.nameField).toBe('name');
        });
    });
});
