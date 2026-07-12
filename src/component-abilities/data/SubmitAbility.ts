/**
 * SubmitAbility 提交能力
 *
 * 提供 submit() 方法，先验证再收集值再触发提交
 */

import type { AbilityDefinition } from '@qimenjs/composable';

export const SubmitAbility: AbilityDefinition = {
    /**
     * 提交方法
     *
     * 流程：validate() → collectValues() → 触发提交
     */
    async submit(): Promise<void> {
        // 1. 验证
        if (typeof this.validate === 'function') {
            const valid = await this.validate();
            if (!valid) return;
        }

        // 2. 收集值
        let values: Record<string, any> = {};
        if (typeof this.collectValues === 'function') {
            values = this.collectValues();
        } else if (this.value !== undefined) {
            values = { value: this.value };
        }

        // 3. 触发提交
        // 如果有 EntityAbility，调用 mgr.create()/update()
        if (this.mgr && typeof this.mgr.create === 'function') {
            await this.mgr.create(values);
        }

        // 通过 emit 广播提交事件（带 source/scopeId，走 eventScope 隔离通道）
        this.emit?.('submit', values, { source: this.id });
    },

    /**
     * 重置方法
     */
    reset(): void {
        if (typeof this.value !== 'undefined') {
            this.value = undefined;
        }
        if (typeof this.errors !== 'undefined') {
            this.setAbilityState?.('ValidateAbility:errors', []);
        }
    },
};
