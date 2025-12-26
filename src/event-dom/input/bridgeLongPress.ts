import type { EventScope } from '@orbitjs/event-core';
import { bridgeInputToBus } from './bridgeInputToBus';

export function bridgeLongPress<
  Events extends Record<string, any>,
  E extends keyof Events
>(
  scope: EventScope<Events>,
  target: HTMLElement,
  busEvent: E,
  delay = 500
) {
  let timer: number | null = null;

  const start = () => {
    timer = window.setTimeout(() => {
      scope.emit(busEvent, undefined as Events[E]);
    }, delay);
  };

  const cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  target.addEventListener('pointerdown', start);
  target.addEventListener('pointerup', cancel);
  target.addEventListener('pointerleave', cancel);
  target.addEventListener('pointercancel', cancel);

  scope.addCleanup(() => {
    cancel();
    target.removeEventListener('pointerdown', start);
    target.removeEventListener('pointerup', cancel);
    target.removeEventListener('pointerleave', cancel);
    target.removeEventListener('pointercancel', cancel);
  });
}
