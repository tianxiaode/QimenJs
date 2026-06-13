/**
 * 数据处理注册器模块增强
 * 
 * 扩展 Registrars 接口，提供类型安全的访问
 * 
 * @module data-processor/register
 */

import { DataProcessorRegistrar } from './DataProcessorRegistrar';

declare module '../../registry/types' {
    interface Registrars {
        /**
         * 数据处理注册器
         * 
         * @description 统一管理所有数据处理管道
         * 
         * @example
         * // 注册处理器
         * Registry.dataProcessor.register('abp-post', {
         *     name: 'abp-extract',
         *     weight: 100,
         *     handle: async (ctx) => { /* ... *\/ }
         * });
         * 
         * // 执行管道
         * await Registry.dataProcessor.execute('abp-post', context);
         */
        dataProcessor: DataProcessorRegistrar;
    }
}
