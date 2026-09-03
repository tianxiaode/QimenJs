import { type AbilityDefinition } from '@/composable';
import { SYSTEM_EVENTS } from '@/events';

export const I18nAbility: AbilityDefinition = {
    /**
     * 刷新i18n配置
     */
    _flushI18n(): void {
        const i18ns = this.i18nOptions;
        for (const optionKey of i18ns) {
            this._applyContentToElement(optionKey);
        }
    },

    /**
     * 初始化i18n配置
     */
    _initI18n(): void {
        if (this.i18nOptions.length === 0) return;
        const off = this.systemOn(SYSTEM_EVENTS.I18N_MESSAGES_UPDATE, () => this._flushI18n());
        this.onCleanup(off);
        this._flushI18n();
    },
} satisfies AbilityDefinition;
