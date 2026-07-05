import type { AbilityDefinition } from '@/composable';

/**
 * LocalGetAbility - 本地获取能力
 *
 * 从本地内存中根据 ID 获取实体。
 * this 指向宿主（Manager），数据字段直接在 this 上访问。
 */
export const LocalGetAbility: AbilityDefinition = {
    get(id: string | number) {
        const { idField } = this.compiledSchema;

        // sourceData 是 Map，优先用 id 直接查找
        let result: any = this.sourceData.get(id) ?? null;

        // 如果 idField 不是默认的 'id'，需要遍历查找
        if (result === null && idField !== 'id') {
            result =
                Array.from(this.sourceData.values()).find((item: any) => item[idField] === id) ??
                null;
        }

        this.item = result;
        this.emit('got', result);

        return result;
    },
};
