import { AbilityBase, type IExposeResult, type AbilityProxy } from '@/composable';

/**
 * LocalGetAbility - 本地获取能力
 * 
 * 从本地内存中根据 ID 获取实体
 */
export class LocalGetAbility extends AbilityBase {
    protected expose(proxy: AbilityProxy): IExposeResult {
        return {
            get: (id: string | number) => {
                const host = proxy.host;
                const { state } = host;
                const { idField } = host.compiledSchema;

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
