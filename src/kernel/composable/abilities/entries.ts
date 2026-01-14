import { LoggerAbility } from "./LoggerAbility";
import { ComposableEntry } from "../../types";

export const LoggerAbilityEntry : ComposableEntry = {
  name: 'logger',
  description: 'Enables logging of Orbit.js events and actions.',
  ctor: LoggerAbility,
}
  