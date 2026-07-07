/**
 * 内置动画关键帧
 *
 * fade-in/out、slide-up/down/left/right、zoom-in/out、collapse/expand
 */

export const animationsCSS = `
@keyframes q-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes q-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes q-slide-up-in {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes q-slide-up-out {
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(100%); opacity: 0; }
}

@keyframes q-slide-down-in {
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes q-slide-down-out {
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(-100%); opacity: 0; }
}

@keyframes q-slide-left-in {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes q-slide-left-out {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(-100%); opacity: 0; }
}

@keyframes q-slide-right-in {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes q-slide-right-out {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}

@keyframes q-zoom-in {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes q-zoom-out {
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(0.8); opacity: 0; }
}

@keyframes q-collapse {
  from { max-height: 1000px; opacity: 1; }
  to { max-height: 0; opacity: 0; overflow: hidden; }
}

@keyframes q-expand {
  from { max-height: 0; opacity: 0; overflow: hidden; }
  to { max-height: 1000px; opacity: 1; }
}
`;
