import { TargetToOptionDefinition, type AbilityDefinition } from '@/composable';
import { t } from '@/i18n';
import { SYSTEM_EVENTS } from '@/events';

export const I18nAbility: AbilityDefinition = {
    /**
     * 刷新i18n配置
     */
    _flushI18n(): void {
        const i18ns = this.i18nOptions;
        for (const optionKey of i18ns) {
            this._applyI18nToElement(optionKey);
        }
    },

    _applyI18nToElement(optionKey: string, def?: TargetToOptionDefinition): void {
        def = def || this.targetToMap.get(optionKey);
        if (!def || !def.to) return; // 没有对应的定义

        const el = def.target ? this.getNodeEl(def.target) : this.el;
        if (!el) return;

        const i18nMeta = this._getData().__i18nMeta[optionKey];
        const useI18n = i18nMeta?.useI18n ?? true; // 是否使用i18n

        const text = useI18n ? t(i18nMeta?.key ?? def.i18n) : this.getData(optionKey);
        this._applyContentToElement(def.target ?? 'root', text, def.to);
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
