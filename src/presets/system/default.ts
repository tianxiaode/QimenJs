// @presets/system/default.ts
import { SystemRegistrar } from '@orbitjs/registry';

export function useSystemPresets() {
    // 设置默认系统配置
    SystemRegistrar.add('default', {
        locale: 'zh-CN',
        dateFormat: 'YYYY-MM-DD',
        datetimeFormat: 'YYYY-MM-DD HH:mm:ss',
        timezone: 'UTC+8',
        password: {
            minLength: 8,
            maxLength: 16,
            upperCase: true,
            lowerCase: true,
            digit: true,
            specialChar: true,
        },
        theme: 'light',
        currency: 'CNY',
        numberFormat: {
            decimalSeparator: '.',
            thousandSeparator: ',',
            precision: 2,
        },
        pagination: {
            defaultPageSize: 10,
            maxPageSize: 100,
        },
        notifications: {
            position: 'top-right',
            timeout: 5000,
        },
        session: {
            timeout: 3600000, // 1 hour in milliseconds
            rememberMe: false,
        }
    });
}