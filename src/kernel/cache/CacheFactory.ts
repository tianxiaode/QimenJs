import { Logger } from '@orbitjs/logger';
import { ICacheProvider, Schema } from '../types';
import { MemoryProvider } from './MemoryProvider';
export class CacheFactory {
    static async create(schema: Schema, _offline: boolean = false): Promise<ICacheProvider> {

        const logger = Logger.for('CacheFactory');
        return new MemoryProvider(schema.name);
    }
}
