/**
 * Registry模块入口文件
 * 提供注册中心的核心功能和各类注册器
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
    MimeTypeRegistrar,
    PatternRegistrar,
    SystemRegistrar,
} from './registrars';
import { RegistryHub } from './RegistryHub';

// 初始化默认注册器
RegistryHub.use(MimeTypeRegistrar.getInstance());
RegistryHub.use(SystemRegistrar.getInstance());
RegistryHub.use(HtmlTemplateRegistrar.getInstance());
RegistryHub.use(DomainRegistrar.getInstance());
RegistryHub.use(PatternRegistrar.getInstance());