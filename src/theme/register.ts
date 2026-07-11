/**
 * 自动注册预设主题
 *
 * 引入 @qimenjs/theme 时自动执行，将预设主题注册到 ThemeRegistrar，
 * 注入 GlobalEventBus，并将 ThemeRegistrar 注册到 RegistryHub。
 */

import { ThemeRegistrar } from './ThemeRegistrar';
import { RegistryHub } from '@qimenjs/registry';
import { globalEventBus } from '@qimenjs/events';
import { lightTheme, darkTheme, chineseThemes } from './presets';
import type { ThemeDefinition } from './types';

/**
 * 注册预设主题到 ThemeRegistrar
 *
 * @param extra - 额外的主题定义数组，与预设主题合并注册
 */
export function registerPresetThemes(extra?: ThemeDefinition[]): void {
    const registrar = ThemeRegistrar.getInstance();
    registrar.register(lightTheme);
    registrar.register(darkTheme);
    if (extra) {
        for (const theme of extra) {
            registrar.register(theme);
        }
    }
}

/**
 * 注册中国传统色主题到 ThemeRegistrar
 *
 * 包含：青瓷、朱砂、靛蓝、鹅黄、紫檀、墨色、黛色 共 7 个主题。
 * 需用户手动调用，不会在 import 时自动注册。
 */
export function registerChineseThemes(): void {
    const registrar = ThemeRegistrar.getInstance();
    for (const theme of chineseThemes) {
        registrar.register(theme);
    }
}

// 将 ThemeRegistrar 注册到 RegistryHub
const registrar = ThemeRegistrar.getInstance();
registrar.initEventBus(globalEventBus);
RegistryHub.use(registrar);

// 自动注册预设主题
registerPresetThemes();
