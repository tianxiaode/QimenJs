/**
 * @qimenjs/i18n
 *
 * 极简国际化模块 - 零依赖
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
 * ```ts
 * // JS 中使用
 * import { i18n } from '@qimenjs/i18n';
 *
 * i18n.t('common.save');                    // '保存'
 * i18n.t('greeting', { name: 'World' });    // '你好, World'
 *
 * // 切换语言
 * await i18n.loadScript('/locales/en-US.js');
 * i18n.locale = 'en-US';
 *
 * // 监听变更
 * i18n.onLocaleChange(() => { /* 重渲染 *\/ });
 * ```
 */

export * from './types';
export { I18nManager, i18n, registerMessages } from './I18nManager';
