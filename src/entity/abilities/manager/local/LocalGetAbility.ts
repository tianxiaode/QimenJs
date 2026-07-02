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

        // sourceData 是 Map，优先用 id 直接查找
        let result: any = state.sourceData.get(id) ?? null;

        // 如果 idField 不是默认的 'id'，需要遍历查找
        if (result === null && idField !== 'id') {
            result = Array.from(state.sourceData.values()).find(
                (item: any) => item[idField] === id
            ) ?? null;
        }

        state.item = result;
        this.emit('got', result);

        return result;
    },
};
