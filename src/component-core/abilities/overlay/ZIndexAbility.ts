import type { AbilityDefinition } from '@/composable';
import { ZIndexLevel, zIndexManager } from '../../engine';

export const ZIndexAbility: AbilityDefinition = {
    _zIndexLevel: {
        get(): number {
            return this.abilityState('ZIndexAbility:zIndexLevel', () => ZIndexLevel.notification);
        },
        set(value: number) {
            this.setAbilityState('ZIndexAbility:zIndexLevel', value);
        },
    },

    acquireZIndex(level?: number): number {
        const zLevel = level ?? this._zIndexLevel;
        return zIndexManager.acquire(zLevel);
    },

    releaseZIndex(): void {
        zIndexManager.release(this._zIndexLevel);
    },
} satisfies AbilityDefinition;
