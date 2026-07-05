import type { AbilityDefinition } from '@/composable';

/**
 * RemoteGetAbility - 远程获取能力
 *
 * this 指向宿主（Manager），this.state 可直接访问。
 */
export const RemoteGetAbility: AbilityDefinition = {
    /**
     * 远程获取实体
     *
     * @param id 要获取的实体ID
     * @returns Promise<any> 获取的实体的Promise
     */
    async get(id: string | number): Promise<any> {
        const { idField } = this.schemaKeys;

        const options = await this.buildOptions('get', { [idField]: id }, null, {});
        const context = await this.fetch('get', options);

        const result = context.data?.item;

        this.updateItem(result);
        return result;
    },
};
