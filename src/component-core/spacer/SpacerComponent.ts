/**
 * SpacerComponent 占位符组件
 *
 * 轻量占位元素，直接派生 ComposableBase（无模板/能力/生命周期），
 * 手工附加一个 div，供 flex 布局撑开或固定宽度占位。
 *
 * - flex：附加 CSS flex 值，默认 '1'（弹性撑满剩余空间）
 * - width：设置 min-width + max-width + flex:none，锁成固定宽度占位
 *
 * @example
 * ```ts
 * new SpacerComponent()                    // flex:1 弹性占位
 * new SpacerComponent({ flex: 2 })         // 自定义 flex 比例
 * new SpacerComponent({ width: 32 })       // 32px 固定宽占位
 * new SpacerComponent({ width: '2rem' })   // 固定 2rem 占位
 * ```
 */

import { ComposableBase } from '@/composable';
import { ComponentRegistrar } from '../ComponentRegistrar';
import './spacer.css';

class SpacerComponent extends ComposableBase {
    static type = 'spacer';
    el: HTMLElement;

    constructor(options: { flex?: number | string; width?: number | string } = {}) {
        super(options);
        this.el = document.createElement('div');
        this.el.className = 'q-spacer';

        const { flex, width } = options;
        if (width != null) {
            const w = typeof width === 'number' ? `${width}px` : width;
            this.el.style.minWidth = w;
            this.el.style.maxWidth = w;
            this.el.style.flex = 'none';
        } else {
            this.el.style.flex = String(flex ?? 1);
        }
    }

    createChildren(childReady?: () => void): void {
        childReady?.();
    }

    dispose(): void {
        this.el?.remove();
        (this as any).el = null;
    }
}

// 占位符是核心基础组件，模块加载即注册，无需走应用层 register 步骤
ComponentRegistrar.getInstance().register(SpacerComponent as any);

export { SpacerComponent };
