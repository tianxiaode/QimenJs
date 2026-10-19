export { LabelAbility } from './LabelAbility';
export { FieldItemAbility } from './FieldItemAbility';
export { ValidationAbility } from './ValidationAbility';
export { InfoAbility } from './InfoAbility';

export const FORMFIELD_ABILITIES = [
    LabelAbility,
    FieldItemAbility,
    ValidationAbility,
    InfoAbility,
] as const;
