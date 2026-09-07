import type { AbilityDefinition } from '@/composable';

export type ColorScheme = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type ColorValue = ColorScheme | `${ColorScheme}-outline` | null;

export const ColorAbility = {
    _onColorOptionChange(value: ColorValue, old: ColorValue) {
        this._toggleOptionCls(`${this._cssPrefix}--color-`, value ?? '', old ?? '');
    },
} satisfies AbilityDefinition;
