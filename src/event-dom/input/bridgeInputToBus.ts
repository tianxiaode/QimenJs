import { EventScope } from "@orbitjs/event-core";
import { bridgeInput } from "./bridgeInput";
import { InputType } from "./types";

export function bridgeInputToBus<Events extends Record<string, any>, E extends keyof Events>(
    scope: EventScope<Events>,
    target: EventTarget,
    input: InputType,
    busEvent: E
) {
    bridgeInput(scope, target, input, evt => {
        scope.emit(busEvent, evt as Events[E]);
    });
}
