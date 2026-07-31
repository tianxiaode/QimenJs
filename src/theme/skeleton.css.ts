/**
 * Skeleton 骨架屏样式 — 框架运行时必须的全局 CSS
 *
 * CompileEngine 对每个 type 节点产出 `<div class="q-skeleton"></div>` 骨架占位，
 * 所有组件实例化前默认渲染骨架态，故此样式为框架级必须，由 theme 层统一提供。
 *
 * 任意元素加 .q-skeleton 类即显示 shimmer 占位效果。
 * 配合 SkeletonAbility 使用：component.skeleton = true 自动给 nodeMap 所有节点加此类。
 *
 * 原理：
 * - .q-skeleton → 文字透明 + shimmer 渐变背景
 * - .q-skeleton--circle → 圆形（border-radius: 50%）
 * - .q-skeleton--no-animate → 禁用动画，静态灰色块
 *
 * @example
 * ```html
 * <div class="q-skeleton">加载中的文本</div>
 * <img class="q-skeleton q-skeleton--circle" src="avatar.png">
 * ```
 */

export const skeletonCSS = `
/* Shimmer 动画 */
@keyframes q-skeleton-shimmer {
    0% {
        background-position: -200% 0;
    }
    100% {
        background-position: 200% 0;
    }
}

/* 核心：任意元素加 .q-skeleton 即生效 */
.q-skeleton {
    color: transparent !important;
    background: linear-gradient(
        90deg,
        var(--q-colors-border, #e8e8e8) 25%,
        var(--q-colors-border-light, #f0f0f0) 37%,
        var(--q-colors-border, #e8e8e8) 63%
    );
    background-size: 200% 100%;
    animation: q-skeleton-shimmer 1.5s ease infinite;
    border-radius: 0;
    position: relative;
}

/* 图片/替换元素 */
.q-skeleton img,
.q-skeleton svg {
    visibility: hidden;
}

/* 子元素文字也透明 */
.q-skeleton * {
    color: transparent !important;
}

/* 圆形骨架（头像等） */
.q-skeleton--circle {
    border-radius: 50% !important;
}

/* 禁用动画 */
.q-skeleton--no-animate {
    animation: none;
    background: var(--q-colors-border, #e8e8e8);
}
`;
