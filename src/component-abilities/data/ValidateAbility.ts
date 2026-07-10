/**
 * ValidateAbility 验证能力
 *
 * 提供 errors 和 validate 方法，集成 @qimenjs/validation
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { validate } from '@qimenjs/validation';

export const ValidateAbility: AbilityDefinition = {
    /**
     * errors getter
     */
    errors: {
        get(): string[] {
            return this.abilityState('ValidateAbility:errors', () => []);
        },
    },

    /**
     * 验证规则
     */
    validationRules: {
        get(): any[] {
            return this.abilityState('ValidateAbility:rules', () => []);
        },
        set(value: any[]): void {
            this.setAbilityState('ValidateAbility:rules', value);
        },
    },

    /**
     * 验证方法
     *
     * @returns 验证结果，true 表示通过
     */
    async validate(): Promise<boolean> {
        const rules = this.validationRules;
        if (!rules || rules.length === 0) {
            this.setAbilityState('ValidateAbility:errors', []);
            return true;
        }

        const result = await validate.validate(this.value, rules);

        if (result === null) {
            this.setAbilityState('ValidateAbility:errors', []);
            return true;
        }

        const errors = Array.isArray(result) ? result : [String(result)];
        this.setAbilityState('ValidateAbility:errors', errors);
        return false;
    },
};
