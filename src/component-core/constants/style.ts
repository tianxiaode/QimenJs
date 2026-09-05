/**
 * 全局样式键白名单（走 `q-{key}--{value}` 组合类）
 *
 * 白名单内的 key，样式由 theme 侧统一提供全局类（`q-{key}--{value}`），
 * 组件通过 `_composeStyleCls` 生成；白名单外的 key 走组件 BEM 层（`q-{type}--{value}`）。
 *
 * 判定标准：跨组件语义和值完全一致才进全局，名字相同但各组件样式不同（如
 * disabled/error/loading/focused/color/variant）留在组件 BEM 层。
 *
 * 注意以下 key 虽属「全局」但**非组合模式**，不在此白名单：
 * - hidden：走固定类 `.hidden` / `.invisible` / `.opacity-0`（utilities.css）
 * - radius：走 `_onRadiusOptionChange`（CSS 变量 `--q-radius-*` + setProperty）
 */
export const GLOBAL_STYLE_KEYS = new Set(['size', 'shape']);
