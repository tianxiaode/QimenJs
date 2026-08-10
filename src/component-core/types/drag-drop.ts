// ══════════════════════════════════════════════════════════════
// 拖拽配置（从 tpl-body 迁移）
// ══════════════════════════════════════════════════════════════

/**
 * 拖拽定义 — 行为配置 + 可选影子组件 + 回调
 *
 * key=节点name（触发源），触发方式由 trigger 字段控制。
 *
 * 与 floats 不同，drags 的配置分两部分：
 * - 拖拽行为配置：axis、bounds 等 → 给 DragProcessor 用
 * - 拖拽影子组件：ghost 字段 → 影子组件类型
 *
 * 拖拽回调通过 body 中定义方法实现（函数自动挂原型）：
 *   body: {
 *       drags: { handle: { axis: 'y' } },
 *       onHandleDragStart(ctx) { ... },
 *       onHandleDragEnd(ctx) { ... },
 *   }
 *
 * @example
 * ```ts
 * drags: {
 *     handle: { axis: 'y', bounds: 'parent' },
 *     card:   { ghost: 'DragGhost', axis: 'both', bounds: { left: 0, top: 0 } },
 * }
 * ```
 */
export interface DragDecl {
    /**
     * 拖拽类型 — 覆盖默认的 component.type
     *
     * 默认使用组件的 type 属性（由类名自动派生，如 CardComponent → 'Card'）。
     * 仅在需要将组件伪装成其他类型时使用。
     *
     * @example
     * { axis: 'both' }  // type 自动使用 component.type
     * { type: 'item', axis: 'both' }  // 强制伪装为 'item' 类型
     */
    type?: string;
    /** 拖拽影子组件类型（可选） */
    ghost?: string;
    /** 拖拽轴向：'x' | 'y' | 'both' */
    axis?: 'x' | 'y' | 'both';
    /** 拖拽边界约束 */
    bounds?:
        | HTMLElement
        | { left?: number; top?: number; right?: number; bottom?: number }
        | string;
    /** 拖拽时添加的 CSS 类 */
    activeClass?: string;
    /** 网格吸附步长 */
    grid?: number;
}

/**
 * 放置区配置 — 声明节点可以接收拖拽放置
 *
 * @example
 * ```ts
 * // 基本用法
 * { name: 'dropZone', tag: 'div', drop: true }
 * { name: 'dropZone', tag: 'div', drop: { accept: ['card', 'item'], activeClass: 'drag-over' } }
 * ```
 */
export interface DropDecl {
    /** 接受的拖拽类型列表（为空表示接受所有） */
    accept?: string[];
    /** 拖拽悬停时添加的 CSS 类 */
    activeClass?: string;
    /** 放置时的回调方法名 */
    onDrop?: string;
}

/** 拖拽配置映射表，将拖拽名映射到拖拽声明 */
export type DragDeclMap = Record<string, DragDecl>;
export type DropDeclMap = Record<string, DropDecl>;
