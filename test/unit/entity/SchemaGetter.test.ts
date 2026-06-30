import { FlatLocalEntityState } from '@/entity/state/FlatLocalEntityState';
import type { ILocalSearchParams } from '@/entity/types';
import type { FlatSchema, TreeSchema } from '@/schema';

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
            }))
        }
    };
});

const mockSchema: FlatSchema = {
    name: 'User',
    domain: 'default',
    idField: 'id',
    isTree: false,
    fields: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string' },
    ],
};

describe('Schema getter test', () => {
    let state: FlatLocalEntityState<ILocalSearchParams>;

    beforeEach(() => {
        state = new FlatLocalEntityState(mockSchema, 300000);
    });

    afterEach(() => {
        state.dispose();
    });

    it('should access idField from StateSchemaAbility', () => {
        expect((state as any).idField).toBe('id');
    });

    it('should return default idField when not set', () => {
        const schemaNoIdField: FlatSchema = {
            name: 'NoId',
            domain: 'default',
            isTree: false,
            fields: [],
        };
        const noIdState = new FlatLocalEntityState(schemaNoIdField, 300000);
        expect((noIdState as any).idField).toBe('id');
        noIdState.dispose();
    });

    it('should return default idType when not set', () => {
        expect((state as any).idType).toBe('number');
    });

    it('should return default nameField when not set', () => {
        expect((state as any).nameField).toBe('name');
    });

    it('should return default defaultSort when not set', () => {
        expect((state as any).defaultSort).toBe('');
    });

    it('should return default defaultOrder when not set', () => {
        expect((state as any).defaultOrder).toBe('asc');
    });

    it('should return default searchFields when not set', () => {
        expect((state as any).searchFields).toEqual([]);
    });

    it('should return isTree=false for flat schema', () => {
        expect((state as any).isTree).toBe(false);
    });

    it('should return isLazy=false for flat schema', () => {
        expect((state as any).isLazy).toBe(false);
    });

    it('should return empty string for tree-specific fields on flat schema', () => {
        expect((state as any).root).toBe('');
        expect((state as any).parentIdField).toBe('');
        expect((state as any).childrenField).toBe('');
        expect((state as any).pathField).toBe('');
        expect((state as any).leafField).toBe('');
        expect((state as any).expandedField).toBe('');
        expect((state as any).useFlat).toBe(false);
    });
});

describe('StateSchemaAbility with tree schema', () => {
    const treeSchema: TreeSchema = {
        name: 'Org',
        domain: 'default',
        idField: 'id',
        isTree: true,
        isLazy: true,
        root: '0',
        parentIdField: 'parentId',
        childrenField: 'children',
        pathField: 'path',
        leafField: 'isLeaf',
        expandedField: 'expanded',
        useFlat: true,
        fields: [
            { name: 'id', type: 'string' },
            { name: 'name', type: 'string' },
        ],
    };

    let state: FlatLocalEntityState<ILocalSearchParams>;

    beforeEach(() => {
        state = new FlatLocalEntityState(treeSchema, 300000);
    });

    afterEach(() => {
        state.dispose();
    });

    it('should return isTree=true for tree schema', () => {
        expect((state as any).isTree).toBe(true);
    });

    it('should return isLazy=true for lazy tree schema', () => {
        expect((state as any).isLazy).toBe(true);
    });

    it('should return root from tree schema', () => {
        expect((state as any).root).toBe('0');
    });

    it('should return parentIdField from tree schema', () => {
        expect((state as any).parentIdField).toBe('parentId');
    });

    it('should return childrenField from tree schema', () => {
        expect((state as any).childrenField).toBe('children');
    });

    it('should return pathField from tree schema', () => {
        expect((state as any).pathField).toBe('path');
    });

    it('should return leafField from tree schema', () => {
        expect((state as any).leafField).toBe('isLeaf');
    });

    it('should return expandedField from tree schema', () => {
        expect((state as any).expandedField).toBe('expanded');
    });

    it('should return useFlat=true from tree schema', () => {
        expect((state as any).useFlat).toBe(true);
    });

    it('should return isLazy=false when isLazy is not set', () => {
        const nonLazySchema: TreeSchema = {
            name: 'Org',
            domain: 'default',
            idField: 'id',
            isTree: true,
            isLazy: false,
            root: null,
            fields: [],
        };
        const nonLazyState = new FlatLocalEntityState(nonLazySchema, 300000);
        expect((nonLazyState as any).isLazy).toBe(false);
        nonLazyState.dispose();
    });

    it('should return defaults for missing tree fields', () => {
        const minimalTreeSchema: TreeSchema = {
            name: 'Org',
            domain: 'default',
            idField: 'id',
            isTree: true,
            isLazy: false,
            root: null,
            fields: [],
        };
        const minimalState = new FlatLocalEntityState(minimalTreeSchema, 300000);
        // When isTree=true but optional fields are not set, they return undefined
        expect((minimalState as any).root).toBe(null);
        expect((minimalState as any).parentIdField).toBeUndefined();
        expect((minimalState as any).childrenField).toBeUndefined();
        expect((minimalState as any).pathField).toBeUndefined();
        expect((minimalState as any).leafField).toBeUndefined();
        expect((minimalState as any).expandedField).toBeUndefined();
        expect((minimalState as any).useFlat).toBe(false);
        minimalState.dispose();
    });
});
