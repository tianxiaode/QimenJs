/**
 * ContentAbility — 内容位管理 + Tooltip
 *
 * 职责：
 * 1. 管理 data-content 插槽（在 __initProps 中查询 DOM 并建 contentMap）
 * 2. 管理 Tooltip 浮层
 *
 * 对应 LayoutNode 字段：
 * - TooltipProps: tooltip, tooltipPlacement, tooltipOffset, tooltipShowDelay, tooltipHideDelay, tooltipMaxWidth
 * - props 中的 content 相关配置
 *
 * __initProps 必须在 el 创建后调用，因为需要查询 data-content 元素。
 */

import type { ComposableBase } from '../ComposableBase';
import { ABILITY_INIT_PROPS } from '../ComposableBase';
import { AbilityBase } from './AbilityBase';
import type { TooltipProps } from '../../layout/LayoutNode';

const STATE_KEY = 'ContentAbility';

/** 内容插槽映射：prefix:name → HTMLElement */
export interface ContentMap {
    [slotName: string]: HTMLElement;
}

/** 内容管理器：提供 getter/setter 访问插槽内容 */
export interface ContentManager {
    getSlot(name: string): HTMLElement | undefined;
    setContent(name: string, content: string | Node): void;
}

const tooltipDescriptors: PropertyDescriptorMap = {
    tooltip: {
        get(this: ComposableBase) { return this.abilityState(`${STATE_KEY}:tooltip`); },
        set(this: ComposableBase, v: string | undefined) {
            this.abilityState(`${STATE_KEY}:tooltip`, v);
            // TODO: 浮层管理器集成
        },
        configurable: true, enumerable: true,
    },
    tooltipPlacement: {
        get(this: ComposableBase) { return this.abilityState(`${STATE_KEY}:tooltipPlacement`) ?? 'top'; },
        set(this: ComposableBase, v: 'top' | 'bottom' | 'left' | 'right') {
            this.abilityState(`${STATE_KEY}:tooltipPlacement`, v);
        },
        configurable: true, enumerable: true,
    },
    tooltipOffset: {
        get(this: ComposableBase) { return this.abilityState(`${STATE_KEY}:tooltipOffset`) ?? 8; },
        set(this: ComposableBase, v: number) {
            this.abilityState(`${STATE_KEY}:tooltipOffset`, v);
        },
        configurable: true, enumerable: true,
    },
    tooltipShowDelay: {
        get(this: ComposableBase) { return this.abilityState(`${STATE_KEY}:tooltipShowDelay`) ?? 0; },
        set(this: ComposableBase, v: number) {
            this.abilityState(`${STATE_KEY}:tooltipShowDelay`, v);
        },
        configurable: true, enumerable: true,
    },
    tooltipHideDelay: {
        get(this: ComposableBase) { return this.abilityState(`${STATE_KEY}:tooltipHideDelay`) ?? 0; },
        set(this: ComposableBase, v: number) {
            this.abilityState(`${STATE_KEY}:tooltipHideDelay`, v);
        },
        configurable: true, enumerable: true,
    },
    tooltipMaxWidth: {
        get(this: ComposableBase) { return this.abilityState(`${STATE_KEY}:tooltipMaxWidth`); },
        set(this: ComposableBase, v: number | undefined) {
            this.abilityState(`${STATE_KEY}:tooltipMaxWidth`, v);
        },
        configurable: true, enumerable: true,
    },
};

export class ContentAbility extends AbilityBase {
    static install(component: ComposableBase, config?: Record<string, any>): void {
        Object.defineProperties(component, tooltipDescriptors);
        component.abilityState(`${STATE_KEY}:instance`, new ContentAbility());
    }

    /**
     * 初始化 props（阶段 3）
     * 查询 data-content 元素，建立 contentMap
     * 必须在 el 创建后调用
     */
    [ABILITY_INIT_PROPS](props: Record<string, any>): void {
        // 此方法由渲染器调用，this 指向组件实例
        const component = this as any as ComposableBase;

        // 1. 查询所有 data-content 元素，建立 contentMap
        const contentMap: ContentMap = {};
        const contentEls = component.el.querySelectorAll('[data-content]');
        for (const el of contentEls) {
            const key = (el as HTMLElement).getAttribute('data-content')!;
            contentMap[key] = el as HTMLElement;
        }
        component.abilityState(`${STATE_KEY}:contentMap`, contentMap);

        // 2. 创建 ContentManager
        const manager = createContentManager(component, contentMap);
        component.abilityState(`${STATE_KEY}:contentManager`, manager);

        // 3. 从 props 初始化内容值
        for (const [key, value] of Object.entries(props)) {
            if (contentMap[key] && value !== undefined) {
                manager.setContent(key, value);
            }
        }
    }
}

/**
 * 创建 ContentManager
 */
function createContentManager(component: ComposableBase, contentMap: ContentMap): ContentManager {
    return {
        getSlot(name: string): HTMLElement | undefined {
            return contentMap[name];
        },
        setContent(name: string, content: string | Node): void {
            const el = contentMap[name];
            if (!el) return;
            if (typeof content === 'string') {
                el.textContent = content;
            } else {
                el.innerHTML = '';
                el.appendChild(content);
            }
        },
    };
}
