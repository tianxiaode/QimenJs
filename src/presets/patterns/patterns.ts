// @presets/patterns/patterns.ts
import { PatternRegistrar } from '@orbitjs/registry';
import { presetPatterns } from './entries';

export function usePatternPresets() {
    PatternRegistrar.getInstance().register(presetPatterns);
}
