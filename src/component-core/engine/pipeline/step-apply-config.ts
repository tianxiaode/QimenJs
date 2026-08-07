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
    } else if (hasSetter(instance, key)) {
        instance[key] = value;
    } else if (DEFAULT_NODE_PROP_MAP[key]) {
        instance._updateNode('root', { [key]: value });
    } else if (isWritable(instance, key)) {
        instance[key] = value;
    }
}

/**
 * 检查原型链上是否有 setter（由 ChildNodePropsEngine 安装的内容属性描述符）
 *
 * 组件有同名 setter 时，优先走 setter（操作子节点内容），
 * 而非 DEFAULT_NODE_PROP_MAP（操作 root 元素 DOM 属性）。
 * 避免 text 等字段被错误设置到 root.textContent 破坏组件 DOM 结构。
 */
function hasSetter(instance: any, key: string): boolean {
    let proto = instance;
    while (proto && proto !== Object.prototype) {
        const desc = Object.getOwnPropertyDescriptor(proto, key);
        if (desc) {
            return !!desc.set;
        }
        proto = Object.getPrototypeOf(proto);
    }
    return false;
}

/**
 * 检查属性是否可写（有 setter 或是普通数据属性，排除只读 getter）
 */
function isWritable(instance: any, key: string): boolean {
    let proto = instance;
    while (proto && proto !== Object.prototype) {
        const desc = Object.getOwnPropertyDescriptor(proto, key);
        if (desc) {
            if (desc.set) return true;
            if ('writable' in desc) return desc.writable !== false;
            return false;
        }
        proto = Object.getPrototypeOf(proto);
    }
    return key in instance;
}
