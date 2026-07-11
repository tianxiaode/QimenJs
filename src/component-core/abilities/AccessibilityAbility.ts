/**
 * AccessibilityAbility — ARIA 无障碍属性
 *
 * 对应 LayoutNode 的 AccessibilityProps 字段。
 * 通过 getAria(key) / setAria(key, value) 方法访问，
 * 不再将 28 个 aria 属性暴露到组件顶层。
 *
 * setAria 只写 this.props + this.markDirty(key)，
 * flushAccessibility() 由 ComponentBase.flush() 调用。
 */

import type { AbilityDefinition } from '@/composable';

/**
 * camelCase → kebab-case 映射
 */
const ARIA_MAP: Record<string, string> = {
    role: 'role',
    ariaLabel: 'aria-label',
    ariaDescribedBy: 'aria-describedby',
    ariaLabelledBy: 'aria-labelledby',
    ariaHidden: 'aria-hidden',
    ariaDisabled: 'aria-disabled',
    ariaExpanded: 'aria-expanded',
    ariaSelected: 'aria-selected',
    ariaPressed: 'aria-pressed',
    ariaRequired: 'aria-required',
    ariaInvalid: 'aria-invalid',
    ariaLive: 'aria-live',
    ariaControls: 'aria-controls',
    ariaOwns: 'aria-owns',
    ariaHasPopup: 'aria-haspopup',
    ariaCurrent: 'aria-current',
    ariaLevel: 'aria-level',
    ariaValueText: 'aria-valuetext',
    ariaValueMin: 'aria-valuemin',
    ariaValueMax: 'aria-valuemax',
    ariaValueNow: 'aria-valuenow',
    ariaModal: 'aria-modal',
    ariaReadOnly: 'aria-readonly',
    ariaAutoComplete: 'aria-autocomplete',
    ariaErrorMessage: 'aria-errormessage',
    ariaRowCount: 'aria-rowcount',
    ariaColCount: 'aria-colcount',
    ariaRowIndex: 'aria-rowindex',
    ariaColIndex: 'aria-colindex',
    ariaRowSpan: 'aria-rowspan',
    ariaColSpan: 'aria-colspan',
    ariaSetSize: 'aria-setsize',
    ariaPosInSet: 'aria-posinset',
};

/**
 * 支持的 aria key 类型
 */
export type AriaKey = keyof typeof ARIA_MAP;

export const AccessibilityAbility: AbilityDefinition = {
    /**
     * 获取 ARIA 属性值
     *
     * @param key - ARIA 属性名（camelCase，如 'ariaLabel', 'role'）
     */
    getAria(key: AriaKey): any {
        return this.props[key];
    },

    /**
     * 设置 ARIA 属性值
     *
     * @param key - ARIA 属性名（camelCase，如 'ariaLabel', 'role'）
     * @param value - 属性值，null/undefined 时移除属性
     */
    setAria(key: AriaKey, value: any): void {
        this.setProp(key, value);
    },

    /**
     * 批量设置 ARIA 属性
     *
     * @param values - ARIA 属性键值对
     */
    setAriaBatch(values: Partial<Record<AriaKey, any>>): void {
        for (const [key, value] of Object.entries(values)) {
            this.setProp(key, value);
        }
    },

    flushAccessibility(): void {
        const dirty = this.dirtySet;
        const p = this.props;
        const el = this.el;

        for (const propName in ARIA_MAP) {
            if (!dirty.has(propName)) continue;

            const value = p[propName];
            const attrName = ARIA_MAP[propName];
            if (value !== undefined && value !== null) {
                el.setAttribute(attrName, String(value));
            } else {
                el.removeAttribute(attrName);
            }
        }
    },
};
