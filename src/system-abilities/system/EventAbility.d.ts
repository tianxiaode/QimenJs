import { AbilityBase } from '@/composable/AbilityBase';
import type { IExposeResult } from '@/types/composable';
/**
 * EventAbility - 事件能力类
 *
 * 提供事件监听、一次性监听和事件发射的能力。
 * 通过创建独立的事件作用域（event scope）来管理事件，避免全局污染。
 * 每个实例拥有独立的事件生命周期。
 */
export declare class EventAbility extends AbilityBase {
    readonly name = "Event";
    /**
     * 事件作用域引用
     * @private
     */
    private scope;
    /**
     * 暴露事件相关的操作接口
     */
    protected expose(): IExposeResult;
    /**
     * 销毁事件作用域
     */
    protected onDispose(): void;
}
//# sourceMappingURL=EventAbility.d.ts.map