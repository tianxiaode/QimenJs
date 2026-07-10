/**
 * 主题感知能力接口
 *
 * 组件自动感知主题变更，
 * 监听 ThemeRegistrar 的主题变更事件。
 *
 * 所有组件都需要此能力。
 */

export interface IThemeAbility {
    /**
     * 主题变更回调
     *
     * 当主题切换时由 ThemeAbility 自动调用。
     * 子类可覆盖此方法实现主题响应逻辑。
     */
    onThemeChange?(event: any): void;
}
