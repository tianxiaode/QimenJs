import { AbilityBase, type IExposeResult } from '@/composable';

/**
 * LocalGetAbility - 本地获取能力
 * 
 * 从本地内存中根据 ID 获取实体
 */
export class LocalGetAbility extends AbilityBase {
    protected expose(): IExposeResult {
        return {
            get: (id: string | number) => {
                const host = this.host;
                const { state } = host;
                const { idField } = host.schema;

                const result = state.sourceData.find(
                    (item: any) => item[idField] === id
                ) || null;

                state.item = result;
                host.emit('got', result);

                return result;
            },
        };
    }
}
