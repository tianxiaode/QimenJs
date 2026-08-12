/** 通用工具类 - 主题提供 */
export const utilityCSS = `
/* ===== 显示/隐藏 ===== */
.hidden { display: none !important; }
.invisible { visibility: hidden !important; }
.opacity-0 { opacity: 0 !important; }
.pointer-events-none { pointer-events: none !important; }

/* ===== 边框 ===== */
.border { border: var(--q-border-normal); }
.border-0 { border: var(--q-border-none); }
.border-t { border-top: var(--q-border-normal); }
.border-r { border-right: var(--q-border-normal); }
.border-b { border-bottom: var(--q-border-normal); }
.border-l { border-left: var(--q-border-normal); }
.border-t-0 { border-top: var(--q-border-none); }
.border-r-0 { border-right: var(--q-border-none); }
.border-b-0 { border-bottom: var(--q-border-none); }
.border-l-0 { border-left: var(--q-border-none); }

/* ===== 圆角 ===== */
.rounded { border-radius: var(--q-radius-md); }
.rounded-none { border-radius: var(--q-radius-none); }
.rounded-sm { border-radius: var(--q-radius-sm); }
.rounded-lg { border-radius: var(--q-radius-lg); }
.rounded-full { border-radius: var(--q-radius-round); }
.rounded-t { border-top-left-radius: var(--q-radius-md); border-top-right-radius: var(--q-radius-md); }
.rounded-r { border-top-right-radius: var(--q-radius-md); border-bottom-right-radius: var(--q-radius-md); }
.rounded-b { border-bottom-right-radius: var(--q-radius-md); border-bottom-left-radius: var(--q-radius-md); }
.rounded-l { border-top-left-radius: var(--q-radius-md); border-bottom-left-radius: var(--q-radius-md); }

/* ===== 层级 ===== */
.z-dropdown { z-index: var(--q-z-index-dropdown); }
.z-sticky { z-index: var(--q-z-index-sticky); }
.z-fixed { z-index: var(--q-z-index-fixed); }
.z-modal-backdrop { z-index: var(--q-z-index-modal-backdrop); }
.z-modal { z-index: var(--q-z-index-modal); }
.z-popover { z-index: var(--q-z-index-popover); }
.z-tooltip { z-index: var(--q-z-index-tooltip); }

/* ===== 透明度 ===== */
.opacity-disabled { opacity: var(--q-opacity-disabled); }
.opacity-hover { opacity: var(--q-opacity-hover); }
.opacity-focus { opacity: var(--q-opacity-focus); }
.opacity-selected { opacity: var(--q-opacity-selected); }
.opacity-activated { opacity: var(--q-opacity-activated); }
.opacity-pressed { opacity: var(--q-opacity-pressed); }
.opacity-drag { opacity: var(--q-opacity-drag); }

/* ===== 动画 ===== */
.animate-fast { animation-duration: var(--q-animation-fast); }
.animate-normal { animation-duration: var(--q-animation-normal); }
.animate-slow { animation-duration: var(--q-animation-slow); }

/* ===== 光标 ===== */
.cursor-default { cursor: var(--q-cursor-default); }
.cursor-pointer { cursor: var(--q-cursor-pointer); }
.cursor-move { cursor: var(--q-cursor-move); }
.cursor-text { cursor: var(--q-cursor-text); }
.cursor-not-allowed { cursor: var(--q-cursor-not-allowed); }
.cursor-grab { cursor: var(--q-cursor-grab); }
.cursor-grabbing { cursor: var(--q-cursor-grabbing); }

/* ===== 溢出 ===== */
.overflow-visible { overflow: var(--q-overflow-visible); }
.overflow-hidden { overflow: var(--q-overflow-hidden); }
.overflow-scroll { overflow: var(--q-overflow-scroll); }
.overflow-auto { overflow: var(--q-overflow-auto); }
`;
