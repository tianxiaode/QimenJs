import { LabelAbility } from './LabelAbility';
import { FieldItemAbility } from './FieldItemAbility';
import { ValidationAbility } from './ValidationAbility';
import { InfoAbility } from './InfoAbility';

export { LabelAbility, FieldItemAbility, ValidationAbility, InfoAbility };

export const FORMFIELD_ABILITIES = [
    LabelAbility,
    FieldItemAbility,
    ValidationAbility,
    InfoAbility,
] as const;
