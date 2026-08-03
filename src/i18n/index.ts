/**
 * @qimenjs/i18n
 *
 * 极简国际化模块 - 零依赖
 *
 * 运行时通过 <script src="/qimen-i18n.js"> 加载 i18n.iife.js，
 * 挂载到 window.qimenI18n / window.__qimen_i18n__ 上。
 * 本包仅提供类型声明，不提供运行时实现。
 *
 * @example
 * ```html
 * <!-- HTML: 加载 i18n 核心，然后动态加载当前语言包 -->
 * <script src="/qimen-i18n.js"></script>
 * <script>
 *   qimenI18n.loadScript('/locales/' + qimenI18n.i18n.locale + '.js');
 * </script>
 * ```
 *
 * ```typescript
 * // TS 中使用（通过 window 全局访问）
 * const i18n = window.__qimen_i18n__;
 * i18n.t('common.save');                    // '保存'
 * i18n.t('greeting', { name: 'World' });    // '你好, World'
 *
 * // 切换语言
 * i18n.locale = 'en-US';
 * ```
 */

/// <reference path="./global.d.ts" />

export * from './types';
export { I18N_PREFIX, getI18nManager, resolveI18nValue, t } from './i18n-utils';
