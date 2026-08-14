/**
 * ChildrenAbility — 子组件递归创建能力
 *
 * 实现子组件递归创建的异步派发，打破「父等子、子等子的子」的同步阻塞链。
 * 使用 setTimeout(0) 将递归创建推到下一个事件循环，通过 callback 协调父子组件。
 *
 * 回调语义：
 * - onChildrenDispatched: 子已派发创建其子的请求，递归链已铺开（同步立即调用）
 * - onChildReady(name, type): 某个子组件已就绪（逐个调用）
 *
 * @example
 * ```typescript
 * this.createChildren({
 *   onChildrenDispatched: () => {
 *     // 父继续不依赖子树的工作
 *   },
 *   onChildReady: (name, type) => {
 *     // 父根据 name/type 执行依赖该子的工作
 *   }
 * })
 * ```
 */

import type { AbilityDefinition } from '@/composable';

/** 子组件递归创建能力，支持异步派发和就绪通知 */
export const ChildrenAbility = {
    /**
     * 异步派发创建子组件
     *
     * 立即通过 onChildrenDispatched 通知父组件已派发（同步调用），
     * 每个子组件 mount 完后通过 onChildReady(name, type) 逐个通知父组件。
     * 子组件的实际创建在下一个事件循环执行，不阻塞父组件。
     *
     * @param callbacks - 回调对象
     * @param callbacks.onChildrenDispatched - 子组件创建已派发的通知回调
     * @param callbacks.onChildReady - 某个子组件就绪的通知回调，返回 name 和 type
     */
    createChildren(
        this: any,
        callbacks: {
            onChildrenDispatched: () => void;
            onChildReady: (name: string, type: string) => void;
        }
    ): void {
        const nodeMetas = this.nodeMapMgr.nodeMetas;
        setTimeout(() => {
            for (const [name, meta] of Object.entries(nodeMetas)) {
                if (!meta.type || !meta.name) continue;

                const child = new meta.type(meta.options);
                this.nodeMapMgr.mountChildComponent(child, name);
                callbacks.onChildReady(meta.name, meta.type.name);

                child.createChildren({
                    onChildrenDispatched: () => {},
                    onChildReady: (name, type) => {
                        callbacks.onChildReady(name, type);
                    },
                });
            }
        }, 0);

        callbacks.onChildrenDispatched();
    },
} as AbilityDefinition;
