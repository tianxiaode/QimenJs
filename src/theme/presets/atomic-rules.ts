/**
 * 预定义原子化 CSS 规则映射
 *
 * 每条规则格式为：{ className: CSS声明 }
 * className 中的值会被转换为 CSS 规则
 */

/**
 * 原子化规则定义
 *
 * key 为 class 名（不含 `q-` 前缀），value 为 CSS 声明对象
 */
export const atomicRules: Record<string, Record<string, string>> = {
    // ===== Flexbox =====
    'flex': { display: 'flex' },
    'inline-flex': { display: 'inline-flex' },
    'flex-row': { 'flex-direction': 'row' },
    'flex-col': { 'flex-direction': 'column' },
    'flex-wrap': { 'flex-wrap': 'wrap' },
    'flex-nowrap': { 'flex-wrap': 'nowrap' },
    'flex-1': { flex: '1 1 0%' },
    'flex-auto': { flex: '1 1 auto' },
    'flex-none': { flex: 'none' },
    'grow': { 'flex-grow': '1' },
    'grow-0': { 'flex-grow': '0' },
    'shrink': { 'flex-shrink': '1' },
    'shrink-0': { 'flex-shrink': '0' },

    // ===== Align Items =====
    'items-start': { 'align-items': 'flex-start' },
    'items-center': { 'align-items': 'center' },
    'items-end': { 'align-items': 'flex-end' },
    'items-stretch': { 'align-items': 'stretch' },
    'items-baseline': { 'align-items': 'baseline' },

    // ===== Justify Content =====
    'justify-start': { 'justify-content': 'flex-start' },
    'justify-center': { 'justify-content': 'center' },
    'justify-end': { 'justify-content': 'flex-end' },
    'justify-between': { 'justify-content': 'space-between' },
    'justify-around': { 'justify-content': 'space-around' },
    'justify-evenly': { 'justify-content': 'space-evenly' },

    // ===== Align Self =====
    'self-start': { 'align-self': 'flex-start' },
    'self-center': { 'align-self': 'center' },
    'self-end': { 'align-self': 'flex-end' },
    'self-stretch': { 'align-self': 'stretch' },

    // ===== Gap (引用 CSS 变量) =====
    'gap-xs': { gap: 'var(--q-spacing-xs)' },
    'gap-sm': { gap: 'var(--q-spacing-sm)' },
    'gap-md': { gap: 'var(--q-spacing-md)' },
    'gap-lg': { gap: 'var(--q-spacing-lg)' },
    'gap-xl': { gap: 'var(--q-spacing-xl)' },

    // ===== Grid =====
    'grid': { display: 'grid' },
    'inline-grid': { display: 'inline-grid' },

    // ===== Padding (引用 CSS 变量) =====
    'p-xs': { padding: 'var(--q-spacing-xs)' },
    'p-sm': { padding: 'var(--q-spacing-sm)' },
    'p-md': { padding: 'var(--q-spacing-md)' },
    'p-lg': { padding: 'var(--q-spacing-lg)' },
    'p-xl': { padding: 'var(--q-spacing-xl)' },
    'px-xs': { 'padding-left': 'var(--q-spacing-xs)', 'padding-right': 'var(--q-spacing-xs)' },
    'px-sm': { 'padding-left': 'var(--q-spacing-sm)', 'padding-right': 'var(--q-spacing-sm)' },
    'px-md': { 'padding-left': 'var(--q-spacing-md)', 'padding-right': 'var(--q-spacing-md)' },
    'px-lg': { 'padding-left': 'var(--q-spacing-lg)', 'padding-right': 'var(--q-spacing-lg)' },
    'px-xl': { 'padding-left': 'var(--q-spacing-xl)', 'padding-right': 'var(--q-spacing-xl)' },
    'py-xs': { 'padding-top': 'var(--q-spacing-xs)', 'padding-bottom': 'var(--q-spacing-xs)' },
    'py-sm': { 'padding-top': 'var(--q-spacing-sm)', 'padding-bottom': 'var(--q-spacing-sm)' },
    'py-md': { 'padding-top': 'var(--q-spacing-md)', 'padding-bottom': 'var(--q-spacing-md)' },
    'py-lg': { 'padding-top': 'var(--q-spacing-lg)', 'padding-bottom': 'var(--q-spacing-lg)' },
    'py-xl': { 'padding-top': 'var(--q-spacing-xl)', 'padding-bottom': 'var(--q-spacing-xl)' },

    // ===== Margin (引用 CSS 变量) =====
    'm-xs': { margin: 'var(--q-spacing-xs)' },
    'm-sm': { margin: 'var(--q-spacing-sm)' },
    'm-md': { margin: 'var(--q-spacing-md)' },
    'm-lg': { margin: 'var(--q-spacing-lg)' },
    'm-xl': { margin: 'var(--q-spacing-xl)' },
    'mx-xs': { 'margin-left': 'var(--q-spacing-xs)', 'margin-right': 'var(--q-spacing-xs)' },
    'mx-sm': { 'margin-left': 'var(--q-spacing-sm)', 'margin-right': 'var(--q-spacing-sm)' },
    'mx-md': { 'margin-left': 'var(--q-spacing-md)', 'margin-right': 'var(--q-spacing-md)' },
    'mx-lg': { 'margin-left': 'var(--q-spacing-lg)', 'margin-right': 'var(--q-spacing-lg)' },
    'mx-xl': { 'margin-left': 'var(--q-spacing-xl)', 'margin-right': 'var(--q-spacing-xl)' },
    'my-xs': { 'margin-top': 'var(--q-spacing-xs)', 'margin-bottom': 'var(--q-spacing-xs)' },
    'my-sm': { 'margin-top': 'var(--q-spacing-sm)', 'margin-bottom': 'var(--q-spacing-sm)' },
    'my-md': { 'margin-top': 'var(--q-spacing-md)', 'margin-bottom': 'var(--q-spacing-md)' },
    'my-lg': { 'margin-top': 'var(--q-spacing-lg)', 'margin-bottom': 'var(--q-spacing-lg)' },
    'my-xl': { 'margin-top': 'var(--q-spacing-xl)', 'margin-bottom': 'var(--q-spacing-xl)' },
    'm-auto': { margin: 'auto' },
    'mx-auto': { 'margin-left': 'auto', 'margin-right': 'auto' },

    // ===== Width / Height =====
    'w-full': { width: '100%' },
    'w-screen': { width: '100vw' },
    'w-auto': { width: 'auto' },
    'h-full': { height: '100%' },
    'h-screen': { height: '100vh' },
    'h-auto': { height: 'auto' },
    'min-w-0': { 'min-width': '0' },
    'min-h-0': { 'min-height': '0' },

    // ===== Text =====
    'text-left': { 'text-align': 'left' },
    'text-center': { 'text-align': 'center' },
    'text-right': { 'text-align': 'right' },
    'text-justify': { 'text-align': 'justify' },
    'font-normal': { 'font-weight': 'var(--q-font-weight-normal)' },
    'font-medium': { 'font-weight': 'var(--q-font-weight-medium)' },
    'font-bold': { 'font-weight': 'var(--q-font-weight-bold)' },
    'truncate': {
        overflow: 'hidden',
        'text-overflow': 'ellipsis',
        'white-space': 'nowrap',
    },

    // ===== Border Radius (引用 CSS 变量) =====
    'rounded-none': { 'border-radius': 'var(--q-radius-none)' },
    'rounded-sm': { 'border-radius': 'var(--q-radius-sm)' },
    'rounded-md': { 'border-radius': 'var(--q-radius-md)' },
    'rounded-lg': { 'border-radius': 'var(--q-radius-lg)' },
    'rounded-round': { 'border-radius': 'var(--q-radius-round)' },

    // ===== Display =====
    'hidden': { display: 'none' },
    'visible': { visibility: 'visible' },
    'invisible': { visibility: 'hidden' },
    'block': { display: 'block' },
    'inline-block': { display: 'inline-block' },

    // ===== Overflow =====
    'overflow-hidden': { overflow: 'hidden' },
    'overflow-auto': { overflow: 'auto' },
    'overflow-scroll': { overflow: 'scroll' },
    'overflow-x-auto': { 'overflow-x': 'auto' },
    'overflow-y-auto': { 'overflow-y': 'auto' },

    // ===== Position =====
    'relative': { position: 'relative' },
    'absolute': { position: 'absolute' },
    'fixed': { position: 'fixed' },
    'sticky': { position: 'sticky' },

    // ===== Cursor =====
    'cursor-pointer': { cursor: 'pointer' },
    'cursor-default': { cursor: 'default' },
    'cursor-not-allowed': { cursor: 'not-allowed' },

    // ===== Border =====
    'border': { border: '1px solid var(--q-colors-border)' },
    'border-0': { border: '0' },
    'border-t': { 'border-top': '1px solid var(--q-colors-border)' },
    'border-b': { 'border-bottom': '1px solid var(--q-colors-border)' },
    'border-l': { 'border-left': '1px solid var(--q-colors-border)' },
    'border-r': { 'border-right': '1px solid var(--q-colors-border)' },

    // ===== Shadow (引用 CSS 变量) =====
    'shadow-none': { 'box-shadow': 'var(--q-shadow-none)' },
    'shadow-sm': { 'box-shadow': 'var(--q-shadow-sm)' },
    'shadow-md': { 'box-shadow': 'var(--q-shadow-md)' },
    'shadow-lg': { 'box-shadow': 'var(--q-shadow-lg)' },

    // ===== Transition (引用 CSS 变量) =====
    'transition-fast': { transition: 'var(--q-transition-fast)' },
    'transition-normal': { transition: 'var(--q-transition-normal)' },
    'transition-slow': { transition: 'var(--q-transition-slow)' },

    // ===== Opacity =====
    'opacity-0': { opacity: '0' },
    'opacity-50': { opacity: '0.5' },
    'opacity-100': { opacity: '1' },

    // ===== Pointer Events =====
    'pointer-events-none': { 'pointer-events': 'none' },
    'pointer-events-auto': { 'pointer-events': 'auto' },

    // ===== User Select =====
    'select-none': { 'user-select': 'none' },
    'select-auto': { 'user-select': 'auto' },
    'select-text': { 'user-select': 'text' },
};
