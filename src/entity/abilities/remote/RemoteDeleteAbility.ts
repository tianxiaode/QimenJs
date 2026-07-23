import type { AbilityDefinition } from '@/composable';
import { KernelError, KernelErrorCode } from '@/error';

/**
 * RemoteDeleteAbility - 远程删除能力
 *
 * 提供删除远程实体的能力，通过HTTP请求与服务器交互。
 * 支持单个或批量删除操作，并自动更新本地状态。
 * 使用 loading 锁防止并发删除请求。
 * this 指向宿主（Manager），数据字段直接在 this 上访问。
 */
export const RemoteDeleteAbility= {
    /**
     * 远程删除一个或多个实体
     *
     * 根据传入的目标类型自动判断是单个删除还是批量删除，
     * 发起相应的API调用并更新本地状态。
     *
     * @param id - 要删除的实体ID或ID数组
     * @throws {KernelError} 当操作进行中或删除请求失败时抛出错误
     */
    async delete(id: string | number | (string | number)[]): Promise<void> {
        // loading 锁保护：防止并发删除请求
        if (this.loading) {
            throw new KernelError(
                'Operation in progress, please wait.',
                KernelErrorCode.ENTITY_OPERATION_IN_PROGRESS
            );
        }

        const isBatch = Array.isArray(id);
        const action = isBatch ? 'batch-delete' : 'delete';
        const options = isBatch
            ? await this.buildOptions(action, {}, { ids: id }, {})
            : await this.buildOptions(action, { [this.idField]: id }, null, {});
        await this.fetch(action, options);
        this.deleteFromItems(id);
    },
} satisfies AbilityDefinition;
