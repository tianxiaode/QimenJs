import { InputEventMap } from "./types";

export const mouseMap: InputEventMap = {
    press: { domEvents: ['mousedown'] },
    release: { domEvents: ['mouseup'] },
    move: { domEvents: ['mousemove'] },
    enter: { domEvents: ['mouseenter'] },
    leave: { domEvents: ['mouseleave'] },
    over: { domEvents: ['mouseover'] },
    out: { domEvents: ['mouseout'] },
    wheel: { domEvents: ['wheel'] },
};
