import { AbilityBase } from '@/composable';
import type { IExposeResult } from '@/composable';
/**
 * EventAbility - 事件能力类
 *
 * 提供事件监听、一次性监听和事件发射的能力。
 * 通过创建独立的事件作用域（event scope）来管理事件，避免全局污染。
 * 每个实例拥有独立的事件生命周期。
 */
export declare class EventAbility extends AbilityBase {
    /**
     * 能力名称（使用类名）
     */
    readonly name = "EventAbility";
    /**
     * 能力描述
     */
    static readonly description = "\u4E8B\u4EF6\u80FD\u529B\uFF1A\u63D0\u4F9B\u4E8B\u4EF6\u76D1\u542C\u3001\u53D1\u5C04\u548C\u7BA1\u7406\u80FD\u529B";
    /**
     * 能力依赖
     */
    static readonly deps: string[];
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