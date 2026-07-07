/**
 * EventBindingAbility 事件绑定能力
 *
 * 桥接 DomEventAdapter，提供 onDom 方法
 */

import type { AbilityDefinition } from '@qimenjs/composable';

export const EventBindingAbility: AbilityDefinition = {
    /**
     * 绑定 DOM 事件
     *
     * @param event - DOM 事件名
     * @param handler - 事件处理器
     * @returns 取消绑定函数
     */
    onDom(event: string, handler: (e: Event) => void): () => void {
        if (!this.el) return () => {};

        // 使用原生 addEventListener
        this.el.addEventListener(event, handler);

        const off = () => {
            if (this.el) {
                this.el.removeEventListener(event, handler);
            }
        };

        // 组件销毁时自动解绑
        this.onCleanup(off);

        return off;
    },
};
