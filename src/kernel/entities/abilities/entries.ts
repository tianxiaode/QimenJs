import { ComposableEntry } from "@/kernel/types";
import { CollectionAbility } from "./CollectionAbility";
import { CollectionAbilityName } from "@/kernel/types/entities/constants";

export const CollectionAbilityEntry: ComposableEntry = {
    name: CollectionAbilityName,
    description: 'Enables event handling for Orbit.js sources and transforms.',
    ctor: CollectionAbility,
}