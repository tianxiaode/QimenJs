import type { II18nManager, IQimenI18nGlobal } from './types';

declare global {
    interface Window {
        __qimen_i18n__?: II18nManager;
        __qimen_i18n_register__?: (locale: string, messages: Record<string, any>) => void;
        qimenI18n?: IQimenI18nGlobal;
    }
}
