// RegistryHub错误类
export * from './errors';

// RegistryHub主类
export * from './RegistryHub';

// 类型定义
export * from './types';
export * from './registrars';
import { HtmlTemplateRegistrar, MimeTypeRegistrar, SystemRegistrar } from './registrars';
import { RegistryHub } from './RegistryHub';

RegistryHub.use(MimeTypeRegistrar.getInstance());
RegistryHub.use(SystemRegistrar.getInstance());
RegistryHub.use(HtmlTemplateRegistrar.getInstance());
