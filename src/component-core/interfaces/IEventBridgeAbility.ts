/**
 * 事件桥接能力接口
 *
 * 声明式配置事件源，自动创建监听。
 * 组件通过 eventBridge 配置声明"我要监听哪个组件的什么事件"。
 *
 * 内置桥接类型：
 * - pagination: 监听 pagechange → onPageChange
 * - crud: 监听 crudaction → onCreate/onEdit/onDelete/...
 * - selection: 监听 selectionchange → onSelectionChange
 * - search: 监听 searchchange → onSearchChange
 * - 自定义: 任意 key → 监听指定 event → 调用指定 handler
 *
 * 所有组件都需要此能力——任何组件都可能需要接收其他组件的事件。
 */

export interface IEventBridgeAbility {
    /**
     * 事件桥接配置
     *
     * 值可以是字符串（简写为 source id）或完整配置对象
     */
    eventBridge: Record<string, any>;

    /**
     * 初始化事件桥接
     *
     * 根据 eventBridge 配置，自动创建事件监听。
     * 组件 dispose 时通过 onCleanup 自动解绑。
     */
    initEventBridge(): void;
}
