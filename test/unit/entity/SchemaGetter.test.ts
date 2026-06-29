import { FlatLocalEntityState } from '@/entity/state/FlatLocalEntityState';
import type { ILocalSearchParams } from '@/entity/types';
import type { FlatSchema } from '@/schema';

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
        console.log('idField:', (state as any).idField);
        expect((state as any).idField).toBe('id');
    });
});
