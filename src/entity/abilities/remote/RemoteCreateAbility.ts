import type { AbilityDefinition } from '@/composable';
import { ENTITY_CRUD_EVENTS } from '@/events';
import { KernelError, KernelErrorCode } from '@/error';

/**
 * RemoteCreateAbility - 远程创建能力
 *
 * 该能力为实体管理器（Entity Manager）提供通过网络请求创建远程数据的功能。
 * 它封装了发送创建请求、处理响应、同步本地状态以及事件发射的完整流程。
 * this 指向宿主（Manager），数据字段直接在 this 上访问。
 */
export const RemoteCreateAbility= {
    /**
     * 创建一条新记录
     *
     * 发送请求以在服务器上创建新记录，并自动同步创建结果到本地状态。
     *
     * @param data - 包含待创建记录所需字段的对象
     * @returns 一个 Promise，解析为服务器返回的、已创建后的完整记录。
     * @throws {KernelError} 当操作进行中或请求失败时抛出错误。
     */
    async create(data: any): Promise<any> {
        // 1. 状态锁保护：防止请求飞行中再次触发
        if (this.loading) {
            throw new KernelError(
                'Operation in progress, please wait.',
                KernelErrorCode.ENTITY_OPERATION_IN_PROGRESS
            );
        }

        // 2. 发起请求 (fetch 内部会自动处理 loading 状态的切换)
        const options = await this.buildOptions('create', {}, data, {});
        const context = await this.fetch('create', options);
        const item = context.data.item;
        this.updateItem(item);
        this.emit(ENTITY_CRUD_EVENTS.CREATED, item);
        return this.item!;
    },
} satisfies AbilityDefinition;
