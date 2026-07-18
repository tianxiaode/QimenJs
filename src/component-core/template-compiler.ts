/**
 * template-compiler.ts — 模板编译工具函数
 *
 * 职责：
 * - 节点定位（findByPath / computeNodePath）
 * - 内容模式推导（inferContentMode）
 * - 事件属性解析（parseEventAttr）
 */

// ─── 节点定位 ───

/**
 * 用索引路径从 root 开始定位元素
 */
export function findByPath(root: HTMLElement, path: number[]): HTMLElement | null {
    let current: Element = root;
    for (const idx of path) {
        if (!current.children[idx]) return null;
        current = current.children[idx];
    }
    return current as HTMLElement;
}

/**
 * 计算节点在 DOM 树中的位置路径
 */
export function computeNodePath(root: HTMLElement, target: HTMLElement): number[] {
    const path: number[] = [];
    let current: Element | null = target;
    while (current && current !== root) {
        const parent: Element | null = current.parentElement;
        if (!parent) break;
        const idx = Array.from(parent.children).indexOf(current);
        if (idx === -1) break;
        path.unshift(idx);
        current = parent;
    }
    return path;
}

// ─── 辅助函数 ───

/**
 * 根据元素标签推导内容操作模式
 */
export function inferContentMode(el: HTMLElement): 'value' | 'src' | 'html' {
    const tag = el.tagName.toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea') return 'value';
    if (tag === 'img') return 'src';
    return 'html';
}

/**
 * 解析事件属性值（data-event / data-emit 通用）
 *
 * 格式：逗号分隔的事件类型，每个可带 ? 修饰符
 * 修饰符：
 * - once：只触发一次
 * - delegate：事件委托
 * - debounce=N：N 毫秒防抖
 * - throttle=N：N 毫秒节流
 *
 * 示例：
 * - "click?once"
 * - "click?debounce=300"
 * - "click?once&debounce=300"
 * - "input?throttle=100"
 * - "input,change"
 */
export function parseEventAttr(eventAttr: string): Array<{
    event: string;
    name?: string;
    once?: boolean;
    delegate?: boolean;
    debounce?: number;
    throttle?: number;
}> {
    const results: Array<{
        event: string;
        name?: string;
        once?: boolean;
        delegate?: boolean;
        debounce?: number;
        throttle?: number;
    }> = [];
    const parts = eventAttr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

    for (const part of parts) {
        let event: string;
        let name: string | undefined;
        let once = false;
        let delegate = false;
        let debounce: number | undefined;
        let throttle: number | undefined;

        const questionIndex = part.indexOf('?');
        if (questionIndex !== -1) {
            event = part.slice(0, questionIndex).trim();
            const modifiers = part.slice(questionIndex + 1).split('&');
            for (const mod of modifiers) {
                if (mod === 'once') once = true;
                else if (mod === 'delegate') delegate = true;
                else if (mod.startsWith('debounce=')) {
                    debounce = parseInt(mod.slice(9), 10);
                } else if (mod.startsWith('throttle=')) {
                    throttle = parseInt(mod.slice(9), 10);
                }
            }
        } else {
            event = part.trim();
        }

        // 支持 click=title 语法：事件名=语义名
        const eqIndex = event.indexOf('=');
        if (eqIndex !== -1) {
            name = event.slice(eqIndex + 1).trim();
            event = event.slice(0, eqIndex).trim();
        }

        results.push({ event, name, once, delegate, debounce, throttle });
    }

    return results;
}
