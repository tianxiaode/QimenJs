// keyboard-map.ts
import { InputEventMap } from './types';

export const keyboardMap: InputEventMap = {
  keydown: {
    domEvents: ['keydown']
  },
  keyup: {
    domEvents: ['keyup']
  }
};
