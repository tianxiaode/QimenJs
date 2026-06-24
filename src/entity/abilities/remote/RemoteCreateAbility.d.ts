/**
 * RemoteCreateAbility - 远程创建能力
 *
 * 该能力为实体管理器（Entity Manager）提供通过网络请求创建远程数据的功能。
 * 它封装了发送创建请求、处理响应、同步本地状态以及事件发射的完整流程。
 */
import { AbilityBase } from '../../../composable';
import { EntityState, IBaseEntityManager, IEntity, IExposeResult, SearchParams } from '../../../types';
export declare class RemoteCreateAbility<T extends IEntity, TSearch extends SearchParams, TState extends EntityState<T, TSearch>> extends AbilityBase<IBaseEntityManager<T, TSearch, TState>> {
    /**
     * 暴露远程创建操作的方法
     *
     * 此方法在能力被激活时由框架调用，用于向宿主对象（host）注入 create 方法。
     *
     * @returns 返回一个包含异步 create 方法的对象，该方法可用于执行创建操作。
     */
    protected expose(): IExposeResult;
}
//# sourceMappingURL=RemoteCreateAbility.d.ts.map