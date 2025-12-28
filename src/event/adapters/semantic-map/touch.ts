import { InputEventMap } from "./types";

export const touchMap: InputEventMap = {
  press:   { domEvents: ['touchstart'] },
  move:    { domEvents: ['touchmove'] },
  release: { domEvents: ['touchend'] },
  cancel:  { domEvents: ['touchcancel'] }
};
