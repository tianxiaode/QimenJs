import { I18N_PREFIX } from '@/i18n';
import { ARIA_PROPS_SET, HTML_PROPS_SET } from '../constants';

/**
 * 拆分组件属性
 *
 * 将平铺的对象拆分为：
 * - props: HTML 标准属性（className、style、disabled 等）
 * - attrs: DOM 属性（data-*、aria-* 等）
 * - options: 业务配置（其他所有字段）
 * - i18nKeys: 国际化键值对
 */
export function splitOptions(obj: any) {
    const props = {} as any;
    const attrs = {} as any;
    const options = {} as any;
    const i18nKeys = [] as any;
    for (const [key, val] of Object.entries(obj)) {
        if (HTML_PROPS_SET.has(key)) {
            props[key] = val;
            continue;
        }

        if (ARIA_PROPS_SET.has(key) || key.startsWith('data_')) {
            attrs![key.replace('_', '-')] = val;
        }

        options![key] = val;
        // 检查 i18n 前缀
        if (typeof val === 'string' && val.startsWith(I18N_PREFIX)) {
            i18nKeys.push({ field: key, i18nKey: val.slice(I18N_PREFIX.length) });
        }
    }
    return { props, attrs, options, i18nKeys };
}
