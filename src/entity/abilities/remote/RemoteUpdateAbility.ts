import type { AbilityDefinition } from '@/composable';
import { ENTITY_CRUD_EVENTS } from '@/events';
import { KernelError, KernelErrorCode } from '@/error';

/**
 * RemoteUpdateAbility - 远程更新能力
 *
 * 该能力为实体管理器（Entity Manager）提供通过网络请求更新远程数据的功能。
 * 它封装了发送更新请求、处理响应、同步本地状态以及事件发射的完整流程。
 * this 指向宿主（Manager），数据字段直接在 this 上访问。
 */
export const RemoteUpdateAbility: AbilityDefinition = {
    /**
     * 更新一条记录
     *
     * 发送请求以更新服务器上的指定记录，并自动同步更新结果到本地状态。
     * 注意：此方法期望 payload 包含主键 ID 字段，以便识别要更新的记录。
     *
     * @param data - 包含待更新字段及其新值的对象，必须包含主键 ID。
     * @returns 一个 Promise，解析为服务器返回的、已更新后的完整记录。
     * @throws {KernelError} 当操作进行中或请求失败时抛出错误。
     */
    async update(data: any): Promise<any> {
        // 1. 状态锁保护
        if (this.loading) {
            throw new KernelError(
                'Operation in progress, please wait.',
                KernelErrorCode.ENTITY_OPERATION_IN_PROGRESS
            );
        }

        // 2. 发起请求
        const options = await this.buildOptions('update', {}, data, {});
        const context = await this.fetch('update', options);
        const item = context.data.item;
        this.updateItem(item);
        this.emit(ENTITY_CRUD_EVENTS.UPDATED, item);
        return this.item!;
    },
};
