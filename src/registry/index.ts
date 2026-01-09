// RegistryHub错误类
export * from './errors';

// RegistryHub主类
export * from './RegistryHub';

// 类型定义
export * from './types';
export * from './registrars';
import * as AllRegistrars from './registrars';
import { RegistryHub } from './RegistryHub';

Object.values(AllRegistrars).forEach((entry: any) => {
    RegistryHub.use(entry);
});
