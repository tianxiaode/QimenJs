import { InputEventMap } from "./types";

export const pointerMap: InputEventMap = {
  press:   { domEvents: ['pointerdown'] },
  move:    { domEvents: ['pointermove'] },
  release: { domEvents: ['pointerup'] },
  cancel:  { domEvents: ['pointercancel'] },
  enter:   { domEvents: ['pointerenter'] },
  leave:   { domEvents: ['pointerleave'] },
  over:    { domEvents: ['pointerover'] },
  out:     { domEvents: ['pointerout'] }
};
