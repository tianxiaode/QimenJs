import { AbilityBase } from '../../../composable';
import { EntityState, IBaseEntityManager, IEntity, IExposeResult, SearchParams } from '../../../types';
/**
 * RemoteUpdateAbility - 远程更新能力
 *
 * 该能力为实体管理器（Entity Manager）提供通过网络请求更新远程数据的功能。
 * 它封装了发送更新请求、处理响应、同步本地状态以及事件发射的完整流程。
 */
export declare class RemoteUpdateAbility<T extends IEntity, TSearch extends SearchParams, TState extends EntityState<T, TSearch>> extends AbilityBase<IBaseEntityManager<T, TSearch, TState>> {
    /**
     * 暴露远程更新操作的方法
     *
     * 此方法在能力被激活时由框架调用，用于向宿主对象（host）注入 update 方法。
     *
     * @returns 返回一个包含异步 update 方法的对象，该方法可用于执行更新操作。
     */
    protected expose(): IExposeResult;
}
//# sourceMappingURL=RemoteUpdateAbility.d.ts.map