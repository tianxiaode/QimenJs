/**
 * Registry模块入口文件
 * 提供注册中心的核心功能和各类注册器
 * 
 * 此文件作为registry模块的统一入口，导出所有相关的类型、类和实例
 * 通过此文件可以方便地访问注册中心的所有功能
 */

// RegistryHub错误类
export * from './errors';

// RegistryHub主类
export * from './RegistryHub';

// 类型定义
export * from './types';
export * from './registrars';

import {
    DomainRegistrar,
    HtmlTemplateRegistrar,
    SystemRegistrar,
} from './registrars';
import { RegistryHub } from './RegistryHub';
import { DataProcessorRegistrar } from '../data-processor';

// 初始化默认注册器
// 在模块加载时自动注册常用的注册器实例，确保它们随时可用
RegistryHub.use(SystemRegistrar.getInstance());
RegistryHub.use(HtmlTemplateRegistrar.getInstance());
RegistryHub.use(DomainRegistrar.getInstance());
RegistryHub.use(DataProcessorRegistrar.getInstance());