import { ComposableEntry, DomEventsAbilityName, EventAbilityName } from "../../types";
import { EventAbility } from "./EventAbility";
import { DomEventsAbility } from "./DomEventsAbility";


export const EventAbilityEntry: ComposableEntry = {
    name: EventAbilityName,
    description: 'Enables event handling for Orbit.js sources and transforms.',
    ctor: EventAbility,
}

export const DomEventsAbilityEntry: ComposableEntry = {
    name: DomEventsAbilityName,
    description: 'Enables DOM event handling for Orbit.js sources and transforms.',
    deps: ['event'],
    ctor: DomEventsAbility,
}

