/**
 * ValueAbility 值能力
 *
 * 提供 value getter/setter，值变更时 markDirty
 */

import type { AbilityDefinition } from '@qimenjs/composable';

export const ValueAbility: AbilityDefinition = {
    /**
     * value getter/setter
     */
    value: {
        get(): any {
            return this.abilityState('ValueAbility:value', () => undefined);
        },
        set(val: any): void {
            this.setAbilityState('ValueAbility:value', val);
            this.markDirty();
            // 调用 onChange 回调
            const onChange = this.abilityState('ValueAbility:onChange', () => undefined) as ((value: any) => void) | undefined;
            if (typeof onChange === 'function') {
                onChange(val);
            }
        },
    },

    /**
     * 值变更回调
     */
    onChange: {
        get(): ((value: any) => void) | undefined {
            return this.abilityState('ValueAbility:onChange', () => undefined);
        },
        set(handler: (value: any) => void): void {
            this.setAbilityState('ValueAbility:onChange', handler);
        },
    },
};
