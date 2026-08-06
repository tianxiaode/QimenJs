/**
 * step-apply-config.ts — FINALIZE 阶段：应用父组件传入的 props
 *
 * 遍历 _rawProps（父组件在 TplNode 上写的自定义属性），
 * 按 DEFAULT_NODE_PROP_MAP 自动分类：
 * - 在 MAP 中 → htmlProps → _updateNode 应用到 root el
 * - 不在 MAP 中 → customProps → 触发组件 setter（key in this）
 * - 值含 i18n: 前缀 → resolve 后赋值，记录到 _i18nFields
 *
 * 必须在 bindListens 之前执行，因为 bindListens 需要 _i18nFields
 * 来决定是否绑定 i18n:localeChange 系统事件。
 */

import type { InitContext } from '../../types/init-context';
import { DEFAULT_NODE_PROP_MAP } from '../../types/common-props';
import { resolveI18nValue } from '@qimenjs/i18n';

const I18N_PREFIX = 'i18n:';

/** 管线步骤：应用父组件传入的 props 配置 */
export function applyConfig(ctx: InitContext): void {
    const { instance } = ctx;
    const rawProps = instance._rawProps;
    if (!rawProps || typeof rawProps !== 'object') return;

    for (const [key, value] of Object.entries(rawProps)) {
        if (value === undefined) continue;

        if (typeof value === 'string' && value.startsWith(I18N_PREFIX)) {
            const i18nKey = value.slice(I18N_PREFIX.length);
            const resolved = resolveI18nValue(value);

            if (!instance._i18nFields) instance._i18nFields = {};
            instance._i18nFields[key] = i18nKey;

            applyProp(instance, key, resolved);
        } else {
            applyProp(instance, key, value);
        }
    }
}

function applyProp(instance: any, key: string, value: any): void {
    if (key === 'cls') {
        instance.addCls(value);
    } else if (DEFAULT_NODE_PROP_MAP[key]) {
        instance._updateNode('root', { [key]: value });
    } else if (key in instance) {
        instance[key] = value;
    }
}
