import { Logger } from '@qimenjs/logger';
import { CacheType, ICacheProvider } from './types';
import { MemoryProvider } from './MemoryProvider';

/**
 * 缓存工厂类
 * 负责创建和释放缓存提供者实例
 */
export class CacheFactory {
    static _instances = new Map<string, ICacheProvider>();

    static async create(type: CacheType, _offline: boolean = false): Promise<ICacheProvider> {
        const logger = Logger.for('CacheFactory');
        logger.debug('Creating cache provider', type);
        const provider = new MemoryProvider();
        this._instances.set(provider.id, provider);
        return provider;
    }

    static release(id: string, autoClear: boolean = false): void {
        const provider = this._instances.get(id);
        if (!provider) return;

        if (autoClear) {
            provider.clear(); // 执行物理清理（如清空内存 Map）
        }

        // 销毁实例引用，让 GC 回收
        this._instances.delete(id);
    }
}
