/**
 * 内容管理能力接口
 *
 * 统一管理组件的所有内容位（图标、文本、徽标等）。
 * 组件通过 static contentSlots 声明内容位，
 * ContentAbility 自动生成对应的属性和方法。
 *
 * 支持 i18n：值以 'i18n:' 开头时自动识别为本地化 key。
 *
 * 不是所有组件都需要此能力：
 * - 需要：Button、Input、Dialog 等有文本/图标内容的组件
 * - 不需要：HBox、VBox、Space 等布局组件
 */

export interface IContentAbility {
    /**
     * 更新所有内容位的 i18n 翻译
     *
     * 语言切换时自动调用，也可手动调用
     */
    updateAllI18n(): void;

    /**
     * 获取所有 i18n 原始 key
     *
     * 返回 { prefix: { name: i18nKey } } 的结构
     * 供外部 i18n 系统查询需要预加载的 key 列表
     */
    getI18nKeys(): Record<string, Record<string, string>>;
}
