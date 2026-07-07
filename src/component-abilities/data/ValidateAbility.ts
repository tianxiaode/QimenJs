/**
 * ValidateAbility 验证能力
 *
 * 提供 errors 和 validate 方法，集成 @qimenjs/validation
 */

import type { AbilityDefinition } from '@qimenjs/composable';

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

        try {
            const { validate } = require('@qimenjs/validation');
            const result = await validate(this.value, rules);

            if (result === true) {
                this.setAbilityState('ValidateAbility:errors', []);
                return true;
            }

            const errors = Array.isArray(result) ? result : [String(result)];
            this.setAbilityState('ValidateAbility:errors', errors);
            return false;
        } catch (e) {
            // validation 不可用，跳过验证
            return true;
        }
    },
};
