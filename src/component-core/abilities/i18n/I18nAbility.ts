import { type AbilityDefinition } from '@/composable';
import { SYSTEM_EVENTS } from '@/events';

export const I18nAbility: AbilityDefinition = {
    _flushI18n(): void {
        for (const [nodeName, text] of this._i18nTextNodes) {
            this._setNodeText(nodeName, text);
        }
    },

    _initI18n(): void {
        const off = this.systemOn(SYSTEM_EVENTS.I18N_MESSAGES_UPDATE, () => this._flushI18n());
        this.onCleanup(off);
    },
} satisfies AbilityDefinition;
