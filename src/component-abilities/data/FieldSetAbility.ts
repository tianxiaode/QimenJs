/**
 * FieldSetAbility 字段集能力
 *
 * 提供 fields getter 和 collectValues 方法，收集所有子字段值
 */

import type { AbilityDefinition } from '@qimenjs/composable';

export const FieldSetAbility: AbilityDefinition = {
    /**
     * fields getter
     */
    fields: {
        get(): any[] {
            return this.abilityState('FieldSetAbility:fields', () => []);
        },
    },

    /**
     * 收集所有子字段值
     *
     * 遍历子组件，收集有 ValueAbility 的子组件的值
     *
     * @returns 字段名到值的映射
     */
    collectValues(): Record<string, any> {
        const values: Record<string, any> = {};

        if (typeof this.eachChild === 'function') {
            this.eachChild((child: any) => {
                if (child.value !== undefined && child.id) {
                    values[child.id] = child.value;
                } else if (child.value !== undefined && child.field) {
                    values[child.field] = child.value;
                }
            });
        }

        return values;
    },
};
