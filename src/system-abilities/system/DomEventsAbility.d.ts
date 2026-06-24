import type { IExposeResult } from '../../types/composable';
import { AbilityBase } from '../../composable';
/**
 * DomEventsAbility - DOM事件能力
 *
 * 为类提供绑定DOM事件的能力，创建事件适配器来处理各种手势事件
 */
export declare class DomEventsAbility extends AbilityBase {
    readonly name = "DomEvents";
    /**
     * 事件适配器（延迟创建）
     * @private
     */
    private _adapter?;
    /**
     * 获取或创建事件适配器
     *
     * @returns 事件适配器实例
     * @private
     */
    private getAdapter;
    /**
     * 暴露绑定事件的方法
     *
     * @returns 包含bind方法的对象，用于绑定DOM事件
     */
    protected expose(): IExposeResult;
    /**
     * 在能力被释放时清理资源
     */
    protected onDispose(): void;
}
//# sourceMappingURL=DomEventsAbility.d.ts.map