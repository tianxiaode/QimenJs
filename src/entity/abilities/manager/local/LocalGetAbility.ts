import type { AbilityDefinition } from '@/composable';

/**
 * LocalGetAbility - 本地获取能力
 * 
 * 从本地内存中根据 ID 获取实体。
 * this 指向宿主（Manager），this.state 可直接访问。
 */
export const LocalGetAbility: AbilityDefinition = {
    get(id: string | number) {
        const { state } = this;
        const { idField } = this.compiledSchema;

        const result = state.sourceData.find(
            (item: any) => item[idField] === id
        ) || null;

        state.item = result;
        this.emit('got', result);

        return result;
    },
};
