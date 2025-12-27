import { SemanticEvent } from "./types";



export const SemanticEventMap: Record<
  SemanticEvent,
  Partial<Record<Platform, string[]>>
> = {
  press: {
    desktop: ['mousedown'],
    mobile: ['touchstart'],
  },
  hover: {
    desktop: ['mouseenter'],
  },
  focus: {
    desktop: ['focus'],
    mobile: ['focus'],
  },
  blur: {
    desktop: ['blur'],
    mobile: ['blur'],
  },
};
