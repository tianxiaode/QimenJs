/**
 * 生命周期能力接口
 *
 * 管理组件的挂载、卸载、销毁，以及组件树关系。
 * 组件通过此能力获得 DOM 生命周期和组件树导航。
 *
 * 职责：
 * - mount：DOM 挂载 + ComponentManager 注册 + 能力 props 初始化
 * - unmount：DOM 卸载
 * - dispose：资源清理 + ComponentManager 注销
 * - up：沿父链查找祖先组件
 */

export interface ILifecycleAbility {
    /** 是否已挂载 */
    readonly mounted: boolean;

    /** 是否已销毁 */
    readonly destroyed: boolean;

    /** 父组件引用（渲染 Pipeline BIND_CHILDREN 步骤自动设置） */
    parent: any | null;

    /**
     * 挂载到目标容器
     *
     * 执行：
     * 1. DOM 挂载（appendChild）
     * 2. 设置 Q_COMPONENT_REF / Q_DATA_ID
     * 3. 注册到 ComponentManager
     * 4. 初始化能力 props（initAbilitiesFromProps）
     *
     * @param container - 目标容器，HTMLElement 或 CSS 选择器
     */
    mount(container: HTMLElement | string): void;

    /** 从 DOM 卸载 */
    unmount(): void;

    /** 销毁组件，清理所有资源 */
    dispose(): void;

    /**
     * 沿父链向上查找指定类型的祖先组件
     *
     * @param type - 要查找的组件类型
     * @returns 匹配的祖先组件，未找到返回 null
     */
    up(type: string): any | null;
}
