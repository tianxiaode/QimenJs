// @presets/system/default.ts
import { SystemRegistrar } from '@orbitjs/registry';

export function useSystemPresets() {
    // 分别注册各项系统配置
    SystemRegistrar.register('locale', 'zh-CN');
    SystemRegistrar.register('dateFormat', 'YYYY-MM-DD');
    SystemRegistrar.register('datetimeFormat', 'YYYY-MM-DD HH:mm:ss');
    SystemRegistrar.register('timezone', 'UTC+8');
    SystemRegistrar.register('password', {
        minLength: 8,
        maxLength: 16,
        upperCase: true,
        lowerCase: true,
        digit: true,
        specialChar: true,
    });
    SystemRegistrar.register('theme', 'light');
    SystemRegistrar.register('currency', 'CNY');
    SystemRegistrar.register('numberFormat', {
        decimalSeparator: '.',
        thousandSeparator: ',',
        precision: 2,
    });
    SystemRegistrar.register('pagination', {
        defaultPageSize: 10,
        maxPageSize: 100,
    });
    SystemRegistrar.register('notifications', {
        position: 'top-right',
        timeout: 5000,
    });
    SystemRegistrar.register('session', {
        timeout: 3600000, // 1 hour in milliseconds
        rememberMe: false,
    });
}