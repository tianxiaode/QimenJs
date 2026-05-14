import { Logger } from '@orbitjs/logger';
import { CacheType, ICacheProvider } from '../types';
import { MemoryProvider } from './MemoryProvider';

/**
 * 缓存工厂类
 * 负责创建和管理缓存提供者实例
 */
export class CacheFactory {

    /** 缓存实例映射表 */
    static _instances = new Map<string, ICacheProvider>();

    /**
     * 创建缓存提供者实例
     * @param type - 缓存类型
     * @param _offline - 是否离线模式（暂未实现）
     * @returns 缓存提供者实例
     */
    static async create(type: CacheType, _offline: boolean = false): Promise<ICacheProvider> {
        const logger = Logger.for('CacheFactory');
        logger.debug('Creating cache provider', type);
        let provider = new MemoryProvider();
        this._instances.set(provider.id, provider);
        return provider;
    }

    /**
     * 释放缓存提供者实例
     * @param id - 缓存实例ID
     * @param autoClear - 是否自动清空缓存，默认为false
     */
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
