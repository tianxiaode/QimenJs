/**
 * 数据处理注册器模块增强
 *
 * 为 RegistryHub 添加类型安全的访问接口
 */

import { DataProcessorRegistrar } from './DataProcessorRegistrar';

declare module '../registry/types' {
    interface Registrars {
        dataProcessor: DataProcessorRegistrar;
    }
}
