import { isTouchDevice } from '@orbitjs/runtime-env';
import type { InputType } from './types';

export type DomEventDescriptor = {
  type: keyof HTMLElementEventMap;
  options?: AddEventListenerOptions;
  filter?: (event: Event) => boolean;
};

export type InputDomMap = Record<
  InputType,
  DomEventDescriptor[]
>;

export const defaultInputDomMap: InputDomMap = {
  press: [
    { type: 'click' },
    {
      type: 'keydown',
      filter: (e) =>
        (e as KeyboardEvent).key === 'Enter' ||
        (e as KeyboardEvent).key === ' '
    }
  ],

  longPress: [
    // 先留空，后续扩展
  ],

  hover: [
    { type: 'mouseenter' }
  ],

  focus: [
    { type: 'focus' }
  ],

  blur: [
    { type: 'blur' }
  ],

  outside: [
    // 这个是特殊的，后面单独处理
  ]
};

export const mobileInputDomMap: InputDomMap = {
    
}

export function getInputDomMap(): InputDomMap {
  if (isTouchDevice()) {
    return mobileInputDomMap;
  }

  return defaultInputDomMap;
}