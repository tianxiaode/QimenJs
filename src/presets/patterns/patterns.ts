// @presets/patterns/patterns.ts
import { PatternRegistrar } from '@orbitjs/registry';

export function usePatternPresets() {
    // 邮箱模式
    PatternRegistrar.register('email', /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);

    // URL模式
    PatternRegistrar.register('url', /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i);

    // IPv4模式
    PatternRegistrar.register(
        'ipv4',
        /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    );

    // IPv6模式
    PatternRegistrar.register(
        'ipv6',
        /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/
    );

    // MAC地址模式
    PatternRegistrar.register('macAddress', /^([0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}$/);

    // 电话号码模式
    PatternRegistrar.register('phone', /^[\+]?[1-9][\d]{0,15}$/);

    // UUID模式
    PatternRegistrar.register(
        'uuid',
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    );

    // Base64模式
    PatternRegistrar.register(
        'base64',
        /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/
    );

    // 十六进制颜色模式
    PatternRegistrar.register('hexColor', /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);

    // RGB颜色模式
    PatternRegistrar.register(
        'rgbColor',
        /^rgb\(\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*,\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*,\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*\)$/
    );

    // RGBA颜色模式
    PatternRegistrar.register(
        'rgbaColor',
        /^rgba\(\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*,\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*,\s*(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\s*,\s*(0|1|0?\.[0-9]+)\s*\)$/
    );

    // 信用卡号模式
    PatternRegistrar.register(
        'creditCard',
        /^(?:\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{1,4}|\d{13,16}|\d{18})$/
    );

    // 中国身份证号模式
    PatternRegistrar.register('chineseId', /(^\d{15}$)|(^\d{17}([0-9]|X)$)/);

    // 中国邮政编码模式
    PatternRegistrar.register('chinesePostcode', /^[1-9]\d{5}$/);

    // 用户名模式
    PatternRegistrar.register('username', /^[a-zA-Z0-9_-]{3,20}$/);

    // 密码相关模式
    PatternRegistrar.register('uppercase', /[A-Z]/); // 大写字母匹配模式
    PatternRegistrar.register('lowercase', /[a-z]/); // 小写字母匹配模式
    PatternRegistrar.register('digit', /\d/); // 数字匹配模式
    PatternRegistrar.register('specialChar', /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/); // 特殊字符匹配模式
}
