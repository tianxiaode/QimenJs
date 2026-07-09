/**
 * AccessibilityAbility — ARIA 无障碍属性
 *
 * 对应 LayoutNode 的 AccessibilityProps 字段。
 * setter 只写 this.props + this.markDirty(key)，
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

const ability: AbilityDefinition = {
    flushAccessibility() {
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

for (const [propName] of Object.entries(ARIA_MAP)) {
    ability[propName] = {
        get() { return this.props[propName]; },
        set(v: any) { this.setProp(propName, v); },
    };
}

export const AccessibilityAbility: AbilityDefinition = ability;
