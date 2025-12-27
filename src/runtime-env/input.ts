export interface InputCapabilities {
  touch: boolean;
  mouse: boolean;
  pointer: boolean;
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0
  );
}

export function detectInputCapabilities(): InputCapabilities {
  if (typeof window === 'undefined') {
    return { touch: false, mouse: false, pointer: false };
  }

  const touch =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0;

  const pointer =
    typeof window.PointerEvent !== 'undefined';

  const mouse = true; // 几乎所有非纯触摸环境都有

  return { touch, mouse, pointer };
}